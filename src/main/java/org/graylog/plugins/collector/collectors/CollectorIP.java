package org.graylog.plugins.collector.collectors;

/**
 * Created by gengxiaotian on 2017/10/25.
 */

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.annotation.Nullable;


@AutoValue
@JsonAutoDetect
public abstract class CollectorIP{

    @JsonProperty("node_details")
    @Nullable
    public abstract CollectorNodeIP nodeDetails();


    @JsonCreator
    public static CollectorIP creat(@JsonProperty("_id") String objectId,
                                    @JsonProperty("node_details") @Nullable CollectorNodeIP nodeDetails){
        return new AutoValue_CollectorIP(nodeDetails);
    }
}
