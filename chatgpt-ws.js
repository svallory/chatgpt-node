// fp-async-webps-staging.webpubsub.azure.com
(function () {
  const MESSAGE_TYPES = {
    handshake: "handshake",
    message: "message",
  };

  class Messenger {
    constructor(url, username, messageHandlers) {
      this.url = url;
      this.username = username;
      this.messageHandlers = messageHandlers;
      this.ws = new WebSocket(`${url}/${username}`);

      // Setup WebSocket events
      this.ws.onopen = () => {
        console.log("Connected to the server");
        this.sendMessage("handshake", {
          username: this.username,
        });
      };

      this.ws.onmessage = (event) => {
        this.parseMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("Disconnected from the server");
      };
    }

    sendMessage(type, data) {
      const message = { username: this.username, type, data };
      this.ws.send(JSON.stringify(message));
    }

    parseMessage(rawData) {
      try {
        const message = JSON.parse(rawData);
        const handler = this.messageHandlers[message.type];

        if (handler) {
          handler(message);
        } else {
          console.log("No handler for message type:", message.type);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    }
  }

  // This will hold our observer for new ChatGPT responses
  let childObserver = null;

  // Function to run when a new child is added
  function onNewChild(newChild) {
    console.log(`ChatGPT is typing...`);
    // Add any specific handling for new child here
  }

  // Callback for child observer
  /**
   *
   * @param {MutationRecord[]} mutationsList
   */
  const childCallback = function (mutationsList) {
    // Handle child mutations here
    // For now, just log that there's a mutation in the child
    for (let mutation in mutationsList) {
      if (mutation.type == "childList") {
        WS.send(
          JSON.stringify({
            type: "message",
            content: Array.from(mutation.addedNodes)
              .map((v) => v.innerText)
              .join(" "),
          })
        );
      } else {
        console.warn(
          `Mutations of type "${mutation.type}" are not handled yet`
        );
      }
    }
  };

  function setupObserver() {
    // Get the parent of the first element with a 'data-testid' attribute
    const testElement = document.querySelector("[data-testid]");

    if (testElement) {
      const parent = testElement.parentNode;

      // Callback function to execute when mutations are observed
      const parentCallback = function (mutationsList) {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // Disconnect previous child observer if it exists
            if (childObserver) {
              childObserver.disconnect();
            }

            // Iterate through all added nodes (children)
            mutation.addedNodes.forEach((node) => {
              // Create and start a new observer for each added child
              childObserver = new MutationObserver(childCallback);
              childObserver.observe(node, { childList: true, subtree: true });

              onNewChild(node); // Handle the new child
            });
          }
        }
      };

      // Create an instance of the parent observer
      const parentObserver = new MutationObserver(parentCallback);

      // Start observing the parent node for configured mutations
      parentObserver.observe(parent, { childList: true });
    }
  }

  function tellGPT(text) {
    document.getElementById("prompt-textarea").value = text;
  }

  function printBlobContent(blob) {
    const reader = new FileReader();

    reader.onload = function () {
      console.log(reader.result); // This is the content of the blob
    };

    reader.onerror = function (error) {
      console.error("Error reading blob:", error);
    };

    reader.readAsText(blob); // Read the blob as text
  }

  window.WS = new Messenger(
    "wss://fp-async-webps-staging.webpubsub.azure.com",
    "ChatGPT",
    {}
  );

  WS.onopen = (conn) => {
    console.log("We are on, baby!");

    WS.send(
      new MessageEvent("handshake", {
        name: "ChatGPT",
      })
    );
  };

  WS.onmessage = (evt) => {
    console.info("[chat] server:", ({ data, origin, source } = evt));
    printBlobContent(evt.data);
    // tellGPT(evt.data);
  };

  WS.onclose = () => console.log("ChatGPT disconnected.");

  WS.onerror = (evt) => {
    console.error(`ERROR: ${JSON.stringify(evt, null, 2)}\n\n`);
  };

  setupObserver();
})();
