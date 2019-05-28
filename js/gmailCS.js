"use strict";

const indox_SDK_APP_ID = "sdk_SYNEPIST_CHROME_64084b987d";
InboxSDK.load(2, indox_SDK_APP_ID).then(function (sdk) {

    // the SDK has been loaded, now do something with it!
    sdk.Compose.registerComposeViewHandler(function (composeView) {

        // only Handle email Compose Window 
        if (!(composeView.isReply() || composeView.isForward()))
            composeView.addButton({
                title: "Generate Title",
                iconUrl: 'https://i.ibb.co/Sw9sQhp/S.png',
                onClick: function (event) {
                    var content = event.composeView.getSelectedBodyText();
                    console.log("Request Sent.");
                    chrome.runtime.sendMessage({email_content: content}, function(response){
                        event.composeView.setSubject(response.summary);
                    });
                }
            });

    });

});