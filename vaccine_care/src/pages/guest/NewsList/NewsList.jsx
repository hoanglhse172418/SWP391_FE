// import React from 'react';
// import { Link } from 'react-router-dom';
// import "./NewsList.css"
// const newsData = [
//   {
//     id: 1,
//     title: 'Hưởng ứng ngày Viêm não Thế giới, nâng cao nhận thức phòng bệnh chủ động',
//     summary: 'Ngày Viêm não Thế giới chính thức ra đời vào ngày 22/2/2014, hướng tới những người có cuộc sống bị ảnh hưởng nghiêm trọng bởi tình trạng viêm não, đồng thời nỗ lực nâng cao nhận thức cộng đồng trong công cuộc phòng, chống bệnh viêm não. Kể từ khi ra mắt, Ngày Viêm não Thế giới đã tiếp cận khoảng 628 triệu người trên toàn thế giới cùng chung tay đẩy lùi và khắc phục hậu quả do viêm não – căn bệnh tấn công khoảng 10 – 15/100.000 người mỗi năm, có thể ảnh hưởng đến bất kỳ ai, đặc biệt là người trẻ tuổi.',
//     image: 'https://vnvc.vn/wp-content/uploads/2025/02/ngay-viem-nao-the-gioi-2025.jpg'
//   },
//   {
//     id: 2,
//     title: 'Cảnh báo sự gia tăng ca bệnh não mô cầu thường gặp vào mùa Đông – Xuân',
//     summary: 'Bệnh do vi khuẩn não mô cầu là nhóm các bệnh nhiễm khuẩn cấp tính nguy hiểm do vi khuẩn Neisseria meningitidis gây ra, lây truyền qua đường hô hấp. Đây là bệnh có khả năng lây lan thành dịch, thường xuất hiện vào mùa Đông – Xuân. Theo thống kê từ Bộ Y tế, số ca mắc viêm não mô cầu có xu hướng tăng lên vào thời điểm thời tiết lạnh, độ ẩm cao. Trong những tháng đầu năm, đặc biệt là từ tháng 11 đến tháng 3, tình trạng lây lan bệnh cao hơn do sự tập trung đông người, thường xảy ra trong các trường học, khu công nghiệp và các sự kiện xã hội.',
//     image: 'https://vnvc.vn/wp-content/uploads/2025/02/canh-bao-gia-tang-nao-mo-cau.jpg'
//   }
// ];

// export const NewsList = () => {
//   return (
//     <div className="container mt-4">
//       <h2 className="text-center NewlistPage-title mb-4">Tin Tức Y Tế</h2>
//       <div className="row">
//         {newsData.map(news => (
//           <div className="col-md-6 mb-4" key={news.id}>
//             <div className="card h-100">
//               <img src={news.image} className="card-img-top" alt={news.title} />
//               <div className="card-body">
//                 <h5 className="card-title">{news.title}</h5>
//                 <div className='NewlistPage-flex'>
//                 <Link to={`/news/${news.id}`} className="btn NewlistPage-bnt ">Xem chi tiết</Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default NewsList;
// NewsList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./NewsList.css";
import axios from 'axios';

export const NewsList = () => {
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsdata.io/api/1/latest?country=vi&category=health&apikey=pub_78791b36826433a249e142864eccb664c8a3d`
        );
        const articles = response.data.results;
        setNewsData(articles);
      } catch (error) {
        console.error('Lỗi khi fetch tin tức:', error);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center NewlistPage-title mb-4">Tin Tức Y Tế</h2>
      <div className="row">
        {newsData.map((news, index) => (
          <div className="col-md-6 mb-4" key={news.article_id || index}>
            <div className="card h-100">
              <img src={news.image_url} className="card-img-top" alt={news.title} />
              <div className="card-body">
                <h5 className="card-title">{news.title}</h5>
                <div className='NewlistPage-flex'>
                  <Link to={`/news/${news.article_id}`} className="btn NewlistPage-bnt">Xem chi tiết</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NewsList;
