import matter from 'gray-matter';

const importAll = (r) => r.keys().map(r);
const markdownFiles = importAll(require.context('../blogPosts', false, /\.md$/))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function getAllPostIds() {
  return markdownFiles.map(file => {
    const { data } = matter(file.default);
    return {
      params: { id: data.id.toString() }
    };
  });
}

export function getPostData(id) {
  const file = markdownFiles.find(file => {
    const { data } = matter(file.default);
    return data.id.toString() === id;
  });

  if (!file) return null;

  const { data, content } = matter(file.default);
  return { ...data, content };
}

export function getSortedPostsData() {
  return markdownFiles.map(file => {
    const { data } = matter(file.default);
    return data;
  });
}