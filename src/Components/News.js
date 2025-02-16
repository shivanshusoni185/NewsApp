import React, {useEffect, useState} from 'react'
import NewsItem from './NewsItem'
import Spinner from './Spinner'
import PropTypes from 'prop-types'
import InfiniteScroll from "react-infinite-scroll-component"

const News = (props) => {
    const [articles, setArticles] = useState([])  // Initialize as empty array
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const updateNews = async () => {
        try {
            props.setProgress(10);
            const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
            setLoading(true);
            const response = await fetch(url);
            props.setProgress(30);
            const parsedData = await response.json();
            props.setProgress(70);

            if (parsedData.status === "ok") {
                setArticles(parsedData.articles || []);
                setTotalResults(parsedData.totalResults || 0);
            } else {
                console.error("API Error:", parsedData);
                setArticles([]);
                setTotalResults(0);
            }
            
            setLoading(false);
            props.setProgress(100);
        } catch (error) {
            console.error("Error fetching news:", error);
            setArticles([]);
            setTotalResults(0);
            setLoading(false);
            props.setProgress(100);
        }
    }

    useEffect(() => {
        updateNews();
        // eslint-disable-next-line
    }, [])

    const fetchMoreData = async () => {
        try {
            const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page+1}&pageSize=${props.pageSize}`;
            setPage(page + 1);
            const response = await fetch(url);
            const parsedData = await response.json();
            
            if (parsedData.status === "ok") {
                setArticles(prevArticles => [...prevArticles, ...(parsedData.articles || [])]);
                setTotalResults(parsedData.totalResults || 0);
            }
        } catch (error) {
            console.error("Error fetching more news:", error);
        }
    }

    return (
        <>
            <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
                Newsly - Top {capitalizeFirstLetter(props.category)} Headlines
            </h1>
            {loading && <Spinner />}
            <InfiniteScroll
                dataLength={articles?.length || 0}
                next={fetchMoreData}
                hasMore={articles?.length < totalResults}
                loader={<Spinner/>}
            > 
                <div className="container">
                    <div className="row">
                        {articles?.map((element, index) => (
                            <div className="col-md-4" key={element.url || index}>
                                <NewsItem 
                                    title={element.title || ""}
                                    description={element.description || ""}
                                    imageUrl={element.urlToImage}
                                    newsUrl={element.url}
                                    author={element.author}
                                    date={element.publishedAt}
                                    source={element.source?.name}
                                />
                            </div>
                        ))}
                    </div>
                </div> 
            </InfiniteScroll>
        </>
    )
}

News.defaultProps = {
    country: 'in',
    pageSize: 8,
    category: 'general',
}

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    setProgress: PropTypes.func
}

export default News