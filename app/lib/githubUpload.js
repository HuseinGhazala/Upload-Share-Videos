import path from 'path';

function getPrimaryConfig() {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  const owner = process.env.GITHUB_UPLOAD_OWNER || 'HuseinGhazala';
  const repo = process.env.GITHUB_UPLOAD_REPO || 'vide';
  const branch = process.env.GITHUB_UPLOAD_BRANCH || 'main';
  const folder = process.env.GITHUB_UPLOAD_FOLDER || 'uploads';

  if (!token) return null;
  return { token, owner, repo, branch, folder };
}

function getSecondaryConfig() {
  const repo = process.env.GITHUB_UPLOAD2_REPO;
  if (!repo) return null;

  const primaryOwner = process.env.GITHUB_UPLOAD_OWNER || 'HuseinGhazala';
  const secondaryOwner =
    process.env.GITHUB_UPLOAD2_OWNER || primaryOwner;
  const sameAccount =
    primaryOwner.toLowerCase() === secondaryOwner.toLowerCase();

  const explicitSecondaryToken = process.env.GITHUB_UPLOAD2_TOKEN;
  let token;
  if (explicitSecondaryToken) {
    token = explicitSecondaryToken;
  } else if (sameAccount) {
    token = process.env.GITHUB_UPLOAD_TOKEN;
  } else {
    console.warn(
      '[GitHub mirror] Second repo uses another GitHub account/org. Set GITHUB_UPLOAD2_TOKEN from that account (fine-grained: Contents Read/Write on that repo). Reusing GITHUB_UPLOAD_TOKEN only works when GITHUB_UPLOAD2_OWNER matches GITHUB_UPLOAD_OWNER.'
    );
    return null;
  }

  if (!token) {
    console.warn('[GitHub mirror] No token available for secondary repo.');
    return null;
  }

  const branch = process.env.GITHUB_UPLOAD2_BRANCH || 'main';
  const folder =
    process.env.GITHUB_UPLOAD2_FOLDER ||
    process.env.GITHUB_UPLOAD_FOLDER ||
    'uploads';

  return { token, owner: secondaryOwner, repo, branch, folder };
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

  const rawGithubUrl = `https://github.com/${config.owner}/${config.repo}/raw/refs/heads/${config.branch}/${contentPath}`;
  const rawUserContentUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${contentPath}`;

  return {
    sourceUrl: rawUserContentUrl,
    rawGithubUrl,
    publicId: contentPath,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  };
}

export async function uploadVideoToGitHub(buffer, { originalName, mimeType }) {
  const primary = getPrimaryConfig();
  if (!primary) return null;

  const safeName = (originalName || 'video').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ext = path.extname(safeName).replace('.', '') || extFromMime(mimeType);
  const base = path.basename(safeName, path.extname(safeName)) || `video_${Date.now()}`;
  const fileName = `${Date.now()}_${base}.${ext}`;
  const primaryPath = `${primary.folder}/${fileName}`;

  const primaryResult = await putFileToRepo(buffer, primaryPath, primary);

  const secondary = getSecondaryConfig();
  let secondaryResult = null;
  if (secondary) {
    const secondaryPath = `${secondary.folder}/${fileName}`;
    try {
      secondaryResult = await putFileToRepo(buffer, secondaryPath, secondary);
    } catch (err) {
      console.error(
        '[GitHub mirror] Secondary repo upload failed:',
        err?.message || err
      );
    }
  }

  return {
    sourceUrl: primaryResult.sourceUrl,
    publicId: primaryResult.publicId,
    rawGithubUrl: primaryResult.rawGithubUrl,
    owner: primaryResult.owner,
    repo: primaryResult.repo,
    branch: primaryResult.branch,
    secondary: secondaryResult,
  };
}
