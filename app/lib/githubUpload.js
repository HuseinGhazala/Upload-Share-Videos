import path from 'path';

function getConfig() {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const owner = process.env.GITHUB_UPLOAD_OWNER || 'HuseinGhazala';
  const repo = process.env.GITHUB_UPLOAD_REPO || 'vide';
  const branch = process.env.GITHUB_UPLOAD_BRANCH || 'main';
  const folder = process.env.GITHUB_UPLOAD_FOLDER || 'uploads';

  if (!token) return null;
  return { token, owner, repo, branch, folder };
}

function extFromMime(mimeType) {
  if (mimeType === 'video/mp4') return 'mp4';
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
}

export async function uploadVideoToGitHub(buffer, { originalName, mimeType }) {
  const config = getConfig();
  if (!config) return null;

  const safeName = (originalName || 'video').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(safeName).replace('.', '') || extFromMime(mimeType);
  const base = path.basename(safeName, path.extname(safeName)) || `video_${Date.now()}`;
  const fileName = `${Date.now()}_${base}.${ext}`;
  const contentPath = `${config.folder}/${fileName}`;
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
      message: `upload video ${fileName}`,
      content: buffer.toString('base64'),
      branch: config.branch,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub upload failed (${response.status}): ${details.slice(0, 300)}`);
  }

  return {
    sourceUrl: `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${contentPath}`,
    publicId: contentPath,
  };
}
