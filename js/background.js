"use strict";

function parse(input) {
    let parsed_input = input.toLowerCase();
    return parsed_input;
}

async function predict(input) {
    const x = new Float32Array(3 * 4 * 5).fill(1);
    const y = new Float32Array(3 * 4 * 5).fill(2);
    const tensorX = new onnx.Tensor(x, 'float32', [3, 4, 5]);
    const tensorY = new onnx.Tensor(y, 'float32', [3, 4, 5]);

    // Run model with Tensor inputs and get the result by output name defined in model.
    const outputMap = await session.run([tensorX, tensorY]);
    const outputData = outputMap.get('sum');
    console.log(`Got an Tensor of size ${outputData.data.length} with all elements being ${outputData.data[0]}`);
    return parse(input);
}

// Create an ONNX inference session with WebGL backend 
// (fallback to CPU if not availble)
const session = new onnx.InferenceSession({ backendHint: 'webgl' });

// load the model
session.loadModel("models/add.onnx");

// Setting default value in storage
chrome.storage.sync.set({summary: "No input yet ... \
Go select some texts and choose summarize in the select menu!"});

// Register ContextMenus
chrome.contextMenus.create({
    id: "Summarize",
    title: "Summarize",
    contexts: ["selection"],
    documentUrlPatterns: ["*://mail.google.com/*"]
});

// Register Listensers
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: 'mail.google.com' }
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (sender.tab && request.email_content) {
            console.log("Request Received.");
            sendResponse({ summary: await predict(request.email_content) });
        }
    });

chrome.contextMenus.onClicked.addListener(async function(info) {
    if (info.menuItemId == "Summarize")
    {
        console.log("Summarize: " + info.selectionText);
        var prediction = await predict(info.selectionText);
        chrome.storage.sync.set({summary: prediction}, function() {
            console.log('Summary is set to ' + prediction);
        });
    }
})
