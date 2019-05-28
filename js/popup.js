"use strict";

const summary = chrome.storage.sync.get(['summary'], function(result) {
    console.log(result);
    document.getElementById("summary").textContent = result.summary;
});
