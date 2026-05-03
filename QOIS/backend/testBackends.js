import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function testIBM() {
  try {
    const r = await axios.get("https://api.quantum.ibm.com/v2/backends", {
      headers: {
        "X-Api-Key": process.env.IBM_API_KEY,
        "X-Instance-Id": process.env.IBM_INSTANCE_ID,
        Accept: "application/json",
      },
    });

    console.log("SUCCESS:", r.data);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}

testIBM();
