// # -----------------------------------------------------------------------------------------
// # MIT No Attribution
// # Permission is hereby granted, free of charge, to any person obtaining a copy of this
// # software and associated documentation files (the "Software"), to deal in the Software
// # without restriction, including without limitation the rights to use, copy, modify,
// # merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// # permit persons to whom the Software is furnished to do so.
// # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// # INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// # PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// # HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// # OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// # SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// # -----------------------------------------------------------------------------------------
console.log('Starting tblcreate.js');

const redshift = require('redshift-sql');

var send = function(event, context, responseStatus, responseData, physicalResourceId) {

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("Response body:\n", responseBody);

    var https = require("https");
    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    var request = https.request(options, function(response) {
        console.log("Status code: " + response.statusCode);
        console.log("Status message: " + response.statusMessage);
        context.done();
    });

    request.on("error", function(error) {
        console.log("send(..) failed executing https.request(..): " + error);
        context.done();
    });

    request.write(responseBody);
    request.end();
}

exports.handler = function(event, context) {
    var config = {
        host: event.ResourceProperties.host,
        db: event.ResourceProperties.db,
        user: event.ResourceProperties.user,
        password: event.ResourceProperties.password,
        port: event.ResourceProperties.port
    };

    if (event.RequestType == 'Create') {
        var rssql = require('redshift-sql')(config);

        var ctr = 'CREATE TABLE ctr (acw_end_tstamp TIMESTAMP, acw_start_tstamp TIMESTAMP, aws_account_id BIGINT NOT NULL, aws_ctr_format_ver VARCHAR(32), channel VARCHAR(255), conn_to_agent_tstamp TIMESTAMP, conn_to_ac_tstamp TIMESTAMP, contact_id VARCHAR(255), org_contact_id VARCHAR(255) distkey, ctr_init_tstamp TIMESTAMP, cust_addr_type VARCHAR(255), cust_addr_val VARCHAR(255), dequeue_tstamp TIMESTAMP, disc_tstamp TIMESTAMP sortkey, enqueue_tstamp TIMESTAMP, handle_attempts INTEGER, handled_by_agent VARCHAR(255), hold_dur INTEGER, init_tstamp TIMESTAMP, last_upd_tstamp TIMESTAMP, ac_addr_type VARCHAR(255), ac_addr_val VARCHAR(255), num_of_holds INTEGER, orig_contact_id VARCHAR(255), prev_contact_id VARCHAR(255), queue VARCHAR(255), rec_loc VARCHAR(255), tlk_duration INTEGER);';

        var ctrattr = 'CREATE TABLE ctr_attr (aws_account_id BIGINT NOT NULL, org_id VARCHAR(255), contact_id VARCHAR(255) distkey, orig_contact_id VARCHAR(255), init_tstamp TIMESTAMP, disc_tstamp TIMESTAMP sortkey, last_upd_tstamp TIMESTAMP, attr_key VARCHAR(255), attr_val VARCHAR(255));';

        rssql(ctr, function cb(err, result) {
            if (err) {
                console.error(err);
                send(event, context, "FAILED");
            } else {
                console.log("Successfully created ctr table.")
                console.log(result);
                rssql(ctrattr, function cb(err, result) {
                    if (err) {
                        console.error(err);
                        send(event, context, "FAILED");
                    } else {
                        console.log("Successfully created ctr_attr table.")
                        console.log(result);
                        send(event, context, "SUCCESS");
                    }
                });
            }
        });
    } else if (event.RequestType == 'Update') {
        send(event, context, "SUCCESS");
    } else if (event.RequestType == 'Delete') {
        send(event, context, "SUCCESS");
    }
};
