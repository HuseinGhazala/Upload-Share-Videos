import path from 'path';

/**
 * Single GitHub destination for video uploads.
 * Set GITHUB_UPLOAD_TOKEN + GITHUB_UPLOAD_OWNER + GITHUB_UPLOAD_REPO on the server.
 */
function getConfig() {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const owner = process.env.GITHUB_UPLOAD_OWNER;
  const repo = process.env.GITHUB_UPLOAD_REPO;

  if (!token || !owner || !repo) {
    if (token && (!owner || !repo)) {
      console.warn(
        '[GitHub] GITHUB_UPLOAD_TOKEN is set but GITHUB_UPLOAD_OWNER or GITHUB_UPLOAD_REPO is missing.'
      );
    }
    return null;
  }

  const branch = process.env.GITHUB_UPLOAD_BRANCH || 'main';
  const folder = process.env.GITHUB_UPLOAD_FOLDER || 'uploads';

  return { token, owner, repo, branch, folder };
}

function extFromMime(mimeType) {
  if (mimeType === 'video/mp4') return 'mp4';
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
}

async function putFileToRepo(buffer, contentPath, config) {
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${contentPath}`;

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'video-upload-app',
    },
    body: JSON.stringify({
      message: `upload video ${path.basename(contentPath)}`,
      content: buffer.toString('base64'),
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub upload failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const rawUserContentUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${contentPath}`;

  return {
    sourceUrl: rawUserContentUrl,
    publicId: contentPath,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  };
}

export async function uploadVideoToGitHub(buffer, { originalName, mimeType }) {
  const config = getConfig();
  if (!config) return null;

  const safeName = (originalName || 'video').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(safeName).replace('.', '') || extFromMime(mimeType);
  const base = path.basename(safeName, path.extname(safeName)) || `video_${Date.now()}`;
  const fileName = `${Date.now()}_${base}.${ext}`;
  const contentPath = `${config.folder}/${fileName}`;

  const result = await putFileToRepo(buffer, contentPath, config);

  return {
    sourceUrl: result.sourceUrl,
    publicId: result.publicId,
    owner: result.owner,
    repo: result.repo,
    branch: result.branch,
  };
}
