export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

async function handleRequest(request, env) {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Root domain
  if (path === "/" || path === "") {
    return new Response(getRootPage(), {
      status: 200,
      headers: { "content-type": "text/html" },
    });
  }

  // API
  if (url.pathname === "/api/images") {
    if (request.method === "POST") {
      return handleUpload(
        request,
        env.CF_ACCOUNT_ID,
        env.CF_API_TOKEN,
        env.DASHBOARD_API_KEY,
      );
    }

    if (request.method === "DELETE") {
      return handleDelete(
        request,
        env.CF_ACCOUNT_ID,
        env.CF_API_TOKEN,
        env.DASHBOARD_API_KEY,
      );
    }

    return handleGetImages(
      request,
      env.CF_ACCOUNT_ID,
      env.CF_API_TOKEN,
      env.DASHBOARD_API_KEY,
    );
  }

  // Match: /images/path/to/image.webp
  if (
    path.startsWith("/images/") &&
    path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    // Remove /images/ prefix
    const imagePath = path.replace("/images/", "");

    return fetch(
      `https://imagedelivery.net/n2znGoOcDrVEbOH_QCaJNA/${imagePath}/public`,
    );
  }

  // Match: 'child-themes/NAME.zip
  if (path.startsWith("/child-themes/") && path.match(/\.zip$/i)) {
    return fetch(`https://pub-56e5b00374b742059562423e7415b00e.r2.dev${path}`);
  }

  // Match: 'demo/DIR/FILE.EXT
  if (path.startsWith("/demo/") && !path.endsWith("/")) {
    return fetch(`https://pub-56e5b00374b742059562423e7415b00e.r2.dev${path}`);
  }

  return new Response(get404Page(), {
    status: 404,
    headers: { "content-type": "text/html" },
  });
}

// UI functions

function getRootPage() {
  return `<!DOCTYPE html>
    <html>
    <head>
      <title>DinoMatic Media</title>
      ${getCSS()}
    </head>
    <body>
      <div class="container">
        <h1>DinoMatic Media</h1>
        <p>Asset delivery for DinoMatic products</p>
        <p><a href="https://dinomatic.com">dinomatic.com</a></p>
      </div>
    </body>
    </html>`;
}

function get404Page() {
  return `<!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      ${getCSS()}
    </head>
    <body>
      <div class="container">
        <h1>404 - Not Found</h1>
        <p>The requested resource could not be found.</p>
        <p><a href="https://dinomatic.com">Return to DinoMatic</a></p>
      </div>
    </body>
    </html>`;
}

function getCSS() {
  return `<style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { color: #333; margin: 0 0 1rem 0; }
    p { color: #666; }
    a { color: #0066cc; text-decoration: none; }
  </style>`;
}

// api functions

// GET /api/images?path={path}
async function handleGetImages(request, accountId, apiToken, apiKey) {
  if (!validateAuthKey(request, apiKey)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "";

    const images = await fetchCloudflareImages(accountId, apiToken);
    const tree = parseDirectoryTree(images);
    const result = getDirectoryByPath(tree, path);

    if (!result) {
      return new Response(JSON.stringify({ error: "Directory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error) {
    console.error("Error in handleGetImages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}

// POST /api/images (upload)
async function handleUpload(request, accountId, apiToken, apiKey) {
  if (!validateAuthKey(request, apiKey)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const customId = formData.get("id"); // e.g., "themes/flavor/logo.webp"

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // Build upload request to Cloudflare Images API
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    if (customId) {
      uploadForm.append("id", customId);
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
        body: uploadForm,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: result.errors?.[0]?.message || "Upload failed",
          details: result.errors,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        image: {
          id: result.result.id,
          filename: result.result.filename,
          uploaded: result.result.uploaded,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  } catch (error) {
    console.error("Error in handleUpload:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}

// DELETE /api/images?id={imageId}
async function handleDelete(request, accountId, apiToken, apiKey) {
  if (!validateAuthKey(request, apiKey)) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  try {
    const url = new URL(request.url);
    const imageId = url.searchParams.get("id");

    if (!imageId) {
      return new Response(JSON.stringify({ error: "No image ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiToken}` },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: result.errors?.[0]?.message || "Delete failed",
          details: result.errors,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    return new Response(JSON.stringify({ success: true, deleted: imageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}

function validateAuthKey(request, apiKey) {
  return request.headers.get("X-API-Key") === apiKey;
}

// Fetch images from Cloudflare Images API
async function fetchCloudflareImages(accountId, apiToken) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CF API error:", response.statusText, errorText);
      throw new Error(`CF API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.result.images.map((img) => ({
      id: img.id || img.filename,
      filename: (img.id || img.filename).split("/").pop() || img.filename,
      uploadedDate: img.uploaded,
      size: img.meta?.size,
      requireSignedURLs: img.requireSignedURLs,
    }));
  } catch (error) {
    console.error("Error fetching CF images:", error);
    throw error;
  }
}

// Parse directory tree from image filenames
function parseDirectoryTree(images) {
  const root = {
    name: "root",
    path: "",
    subdirs: [],
    images: [],
  };

  images.forEach((image) => {
    const parts = image.id.split("/");
    const filename = parts[parts.length - 1];
    const dirPath = parts.slice(0, -1);

    let currentNode = root;
    let currentPath = "";

    dirPath.forEach((dir) => {
      currentPath = currentPath ? `${currentPath}/${dir}` : dir;

      let subdir = currentNode.subdirs.find((d) => d.name === dir);
      if (!subdir) {
        subdir = {
          name: dir,
          path: currentPath,
          subdirs: [],
          images: [],
        };
        currentNode.subdirs.push(subdir);
      }
      currentNode = subdir;
    });

    currentNode.images.push(image);
  });

  return root;
}

// Get directory content by path
function getDirectoryByPath(root, path) {
  if (!path) {
    return root;
  }

  const parts = path.split("/");
  let currentNode = root;

  for (const part of parts) {
    const found = currentNode.subdirs?.find((d) => d.name === part);
    if (!found) {
      return null;
    }
    currentNode = found;
  }

  return {
    path: currentNode.path,
    subdirs: currentNode.subdirs || [],
    images: currentNode.images || [],
  };
}
