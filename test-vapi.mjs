import axios from "axios";

async function testVapi() {
  const assistantId = "e07b41af-c7ab-4f51-8ba1-29eb400eab87";
  const apiKey = "96ec9c43-7823-4388-8f97-302b145610cb"; // Next_Public_Vapi_Api_Key

  console.log("Testing Vapi API with API Key:", apiKey);
  console.log("Assistant ID:", assistantId);

  try {
    // Attempt to make a web call request to see the error directly
    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: assistantId,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Success! Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Vapi API Error Response:", error.response.status, error.response.data);
    } else {
      console.error("Error making request:", error.message);
    }
  }
}

testVapi();
