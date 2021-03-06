/**
 * This file is part of Graylog.
 *
 * Graylog is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Graylog is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Graylog.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.graylog.plugins.collector.collectors.rest;

import com.codahale.metrics.annotation.Timed;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Function;
import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableMap;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.bson.types.ObjectId;
import org.graylog.plugins.collector.audit.CollectorAuditEventTypes;
import org.graylog.plugins.collector.collectors.*;
import org.graylog.plugins.collector.collectors.rest.models.CollectorAction;
import org.graylog.plugins.collector.collectors.rest.models.requests.CollectorRegistrationRequest;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorList;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorRegistrationConfiguration;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorRegistrationResponse;
import org.graylog.plugins.collector.collectors.rest.models.responses.CollectorSummary;
import org.graylog.plugins.collector.permissions.CollectorRestPermissions;
import org.graylog.plugins.collector.system.CollectorSystemConfiguration;
import org.graylog2.Configuration;
import org.graylog2.audit.jersey.AuditEvent;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.indexer.IndexSet;
import org.graylog2.indexer.IndexSetRegistry;
import org.graylog2.plugin.Tools;
import org.graylog2.plugin.database.ValidationException;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.plugin.streams.Stream;
import org.graylog2.plugin.streams.StreamRule;
import org.graylog2.plugin.streams.StreamRuleType;
import org.graylog2.shared.rest.resources.RestResource;
import org.graylog2.streams.StreamImpl;
import org.graylog2.streams.StreamRuleImpl;
import org.graylog2.streams.StreamRuleService;
import org.graylog2.streams.StreamService;
import org.hibernate.validator.constraints.NotEmpty;
import org.joda.time.DateTime;
import org.joda.time.Period;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Api(value = "System/Collectors", description = "Management of Graylog Collectors.")
@Path("/collectors")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CollectorResource extends RestResource implements PluginRestResource {
    private final CollectorService collectorService;
    private final LostCollectorFunction lostCollectorFunction;
    private final Supplier<CollectorSystemConfiguration> configSupplier;
    private final StreamService streamService;
    private final IndexSetRegistry indexSetRegistry;
    private final StreamRuleService streamRuleService;
    private final Configuration configuration;

    @Inject
    public CollectorResource(CollectorService collectorService, Supplier<CollectorSystemConfiguration> configSupplier, StreamService streamService, IndexSetRegistry indexSetRegistry, StreamRuleService streamRuleService, Configuration configuration) {
        this.collectorService = collectorService;
        this.lostCollectorFunction = new LostCollectorFunction(configSupplier.get().collectorInactiveThreshold());
        this.configSupplier = configSupplier;
        this.streamService = streamService;
        this.indexSetRegistry = indexSetRegistry;
        this.streamRuleService = streamRuleService;
        this.configuration = configuration;
    }

    @GET
    @Timed
    @ApiOperation(value = "Lists all existing collector registrations")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public CollectorList list() {
        final List<Collector> collectors = collectorService.all();
        final List<CollectorSummary> collectorSummaries = Collectors.toSummaryList(collectors, lostCollectorFunction);
        return CollectorList.create(collectorSummaries);
    }

    @GET
    @Timed
    @Path("/{collectorId}")
    @ApiOperation(value = "Returns at most one collector summary for the specified collector id")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No collector with the specified id exists")
    })
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public CollectorSummary get(@ApiParam(name = "collectorId", required = true)
                                @PathParam("collectorId") @NotEmpty String collectorId) {
        final Collector collector = collectorService.findById(collectorId);
        if (collector != null) {
            return collector.toSummary(lostCollectorFunction);
        } else {
            throw new NotFoundException("Collector <" + collectorId + "> not found!");
        }
    }

    @GET
    @Timed
    @Path("/ips")
    @ApiOperation(value = "Returns all collector ips")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No collector ip exists")
    })
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public List<CollectorIP> getIPs() {
        final List<CollectorIP> collectors = collectorService.findCollectorIps();
        return collectors;
    }

    @GET
    @Timed
    @Path("/{collectorId}/action")
    @ApiOperation(value = "Returns queued actions for the specified collector id")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No actions found for specified id")
    })
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_READ)
    public List<CollectorAction> getAction(@ApiParam(name = "collectorId", required = true)
                                      @PathParam("collectorId") @NotEmpty String collectorId) {
        final CollectorActions collectorActions = collectorService.findActionByCollector(collectorId, false);
        if (collectorActions != null) {
            return collectorActions.getAction();
        }
        return new ArrayList<>();
    }

    @PUT
    @Timed
    @Path("/{collectorId}")
    @ApiOperation(value = "Create/update a collector registration",
            notes = "This is a stateless method which upserts a collector registration")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    @NoAuditEvent("this is only a ping from collectors, and would overflow the audit log")
    public Response register(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                             @PathParam("collectorId") @NotEmpty String collectorId,
                             @ApiParam(name = "JSON body", required = true)
                             @Valid @NotNull CollectorRegistrationRequest request,
                             @HeaderParam(value = "X-Graylog-Collector-Version") @NotEmpty String collectorVersion) throws Exception {
        final Collector collector = collectorService.fromRequest(collectorId, request, collectorVersion);
        collectorService.save(collector);

        if (!configuration.isAppCenterEnable()){
            String ip = collector.getNodeDetails().ip();

            List<Stream> streams = streamService.loadByTitle("_IP:"+ip);

            if (streams.isEmpty()){
                ObjectId id = new ObjectId();

                if (ip == null){
                    throw new Exception("ip is NULL when registering collector!");
                }

                final IndexSet indexSet = indexSetRegistry.getDefault();

                final Map<String, Object> streamData = ImmutableMap.<String, Object>builder()
                        .put(StreamImpl.FIELD_TITLE, "_IP:"+ip)
                        .put(StreamImpl.FIELD_DESCRIPTION, ip)
                        .put(StreamImpl.FIELD_DISABLED, false)
                        .put(StreamImpl.FIELD_MATCHING_TYPE, StreamImpl.MatchingType.OR.name())
                        .put(StreamImpl.FIELD_CREATOR_USER_ID, "system")
                        .put(StreamImpl.FIELD_CREATED_AT, Tools.nowUTC())
                        .put(StreamImpl.FIELD_DEFAULT_STREAM, false)
                        .put(StreamImpl.FIELD_INDEX_SET_ID, indexSet.getConfig().id())
                        .build();
                final org.graylog2.plugin.streams.Stream stream = new StreamImpl(id, streamData, Collections.emptyList(), Collections.emptySet(), indexSet);

                final String streamId = streamService.save(stream);
                final Map<String, Object> streamRuleData = ImmutableMap.<String, Object>builder()
                        .put(StreamRuleImpl.FIELD_TYPE, StreamRuleType.EXACT.getValue())
                        .put(StreamRuleImpl.FIELD_VALUE, ip)
                        .put(StreamRuleImpl.FIELD_FIELD, "HOSTIP")
                        .put(StreamRuleImpl.FIELD_INVERTED, false)
                        .put(StreamRuleImpl.FIELD_STREAM_ID, new ObjectId(streamId))
                        .build();
                streamRuleService.save(new StreamRuleImpl(streamRuleData));
            }
        }

        final CollectorActions collectorActions = collectorService.findActionByCollector(collectorId, true);
        List<CollectorAction> collectorAction = null;
        if (collectorActions != null) {
            collectorAction = collectorActions.getAction();
        }
        final CollectorSystemConfiguration collectorSystemConfiguration = configSupplier.get();
        CollectorRegistrationResponse collectorRegistrationResponse = CollectorRegistrationResponse.create(
                CollectorRegistrationConfiguration.create(
                    collectorSystemConfiguration.collectorUpdateInterval().toStandardDuration().getStandardSeconds(),
                    collectorSystemConfiguration.collectorSendStatus()),
                collectorSystemConfiguration.collectorConfigurationOverride(),
                collectorAction);
        return Response.accepted(collectorRegistrationResponse).build();
    }

    @PUT
    @Timed
    @Path("/{collectorId}/action")
    @RequiresAuthentication
    @RequiresPermissions(CollectorRestPermissions.COLLECTORS_UPDATE)
    @ApiOperation(value = "Set a collector action")
    @ApiResponses(value = {@ApiResponse(code = 400, message = "The supplied action is not valid.")})
    @AuditEvent(type = CollectorAuditEventTypes.ACTION_UPDATE)
    public Response setAction(@ApiParam(name = "collectorId", value = "The collector id this collector is registering as.", required = true)
                           @PathParam("collectorId") @NotEmpty String collectorId,
                           @ApiParam(name = "JSON body", required = true)
                           @Valid @NotNull List<CollectorAction> request) {
        final CollectorActions collectorActions = collectorService.actionFromRequest(collectorId, request);
        collectorService.saveAction(collectorActions);

        return Response.accepted().build();
    }

    @VisibleForTesting
    protected static class LostCollectorFunction implements Function<Collector, Boolean> {
        private final Period timeoutPeriod;

        @Inject
        public LostCollectorFunction(Period timeoutPeriod) {
            this.timeoutPeriod = timeoutPeriod;
        }

        @Override
        public Boolean apply(Collector collector) {
            final DateTime threshold = DateTime.now().minus(timeoutPeriod);
            return collector.getLastSeen().isAfter(threshold);
        }
    }
}
