window.addEventListener("load", function() {

    function injectExternalScript() {
        // Create a script element and set its src to the extension's script2.js
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("script2.js");
        script.type = "text/javascript";
        script.async = false;

        // Append to the document so it executes within the webpage context
        (document.head || document.documentElement).appendChild(script);

        // Optionally, remove the script tag after execution
        script.onload = function() {
            script.remove();
        };
    }

// Call injectExternalScript when you need script2.js to be injected
    injectExternalScript();


});
