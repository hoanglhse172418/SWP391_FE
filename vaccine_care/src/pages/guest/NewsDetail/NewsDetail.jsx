import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import "./NewsDetail.css";
import axios from 'axios';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          `https://newsdata.io/api/1/latest?country=vi&category=health&apikey=pub_78791b36826433a249e142864eccb664c8a3d`
        );
        const found = res.data.results.find(item => item.article_id === id);
        setNews(found);
      } catch (err) {
        console.error("Lỗi khi tải bài viết chi tiết:", err);
      }
    };
    fetchNews();
  }, [id]);

  if (!news) {
    return (
      <div className="container mt-4 NewsDetail">
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/newlist" className="btn btn-secondary">Quay lại danh sách tin</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 NewsDetail">
      <img src={news.image_url} className="img-fluid mb-4" alt={news.title} />
      <h2 className="mb-3">{news.title}</h2>
      <p>{news.content || news.description || 'Không có nội dung chi tiết'}</p>
      <Link to="/newlist" className="btn btn-secondary">Quay lại danh sách tin</Link>
    </div>
  );
};

export default NewsDetail;
