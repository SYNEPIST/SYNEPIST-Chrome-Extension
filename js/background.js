"use strict";

function parse(input)
{
    let parsed_input = input.toLowerCase();
    return parsed_input; 
}

async function predict(input)
{
    const x = new Float32Array(3 * 4 * 5).fill(1);
    const y = new Float32Array(3 * 4 * 5).fill(2);
    const tensorX = new onnx.Tensor(x, 'float32', [3, 4, 5]);
    const tensorY = new onnx.Tensor(y, 'float32', [3, 4, 5]);
  
    // Run model with Tensor inputs and get the result by output name defined in model.
    const outputMap = await session.run([tensorX, tensorY]);
    const outputData = outputMap.get('sum');
  
    // Check if result is expected.
    // assert.deepEqual(outputData.dims, [3, 4, 5]);
    // assert(outputData.data.every((value) => value === 3));
    console.log(`Got an Tensor of size ${outputData.data.length} with all elements being ${outputData.data[0]}`);
    return parse(input);
}

// Create an ONNX inference session with WebGL backend 
// (fallback to CPU if not availble)
const session = new onnx.InferenceSession({ backendHint: 'webgl'});

// load the model
session.loadModel("models/add.onnx");


chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'mail.google.com'}
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if (sender.tab && request.email_content)
        {
            console.log("Request Received.");
            sendResponse({summary: await predict(request.email_content)});
        }
});
