// This will hold our observer for new ChatGPT responses
let childObserver = null;

// Function to run when a new child is added
function onNewChild(newChild) {
  console.log(`ChatGPT is typing...`);
  // Add any specific handling for new child here
}

// Callback for child observer
const childCallback = function (mutationsList) {
  // Handle child mutations here
  // For now, just log that there's a mutation in the child
  console.log("Mutation in child's subtree: ", mutationsList);
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
