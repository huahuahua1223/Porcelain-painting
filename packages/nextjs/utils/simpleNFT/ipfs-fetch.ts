const fetchFromApi = ({ path, method, body }: { path: string; method: string; body?: object }) =>
  fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .catch(error => console.error("Error:", error));

export const addToIPFS = (yourJSON: object) => fetchFromApi({ path: "/api/ipfs/add", method: "Post", body: yourJSON });

export const uploadFileToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const pinataAPIKEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataAPISECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  console.log("pinataAPIKEY", pinataAPIKEY);
  console.log("pinataAPISECRET", pinataAPISECRET);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    // 构建 headers，确保 API key 和 secret 不为 undefined
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (pinataAPIKEY) {
      headers['pinata_api_key'] = pinataAPIKEY;
    }

    if (pinataAPISECRET) {
      headers['pinata_secret_api_key'] = pinataAPISECRET;
    }
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers,  // 使用已经构建好的 headers
      body: formData,
    });
    console.log("response", response);

    if (!response.ok) {
      throw new Error("Failed to upload file to IPFS");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};


// export const getMetadataFromIPFS = (ipfsHash: string) =>
//   fetchFromApi({ path: "/api/ipfs/get-metadata", method: "Post", body: { ipfsHash } });

export const getMetadataFromIPFS = async (tokenURI: string) => {
  try {
    const response = await fetch(tokenURI);
    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from pinta:", error);
    throw error;
  }
}
  
