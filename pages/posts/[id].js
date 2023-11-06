import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import { useEffect, useState } from 'react';
import GuidelinesTable from "../../components/guidlines";
import Image from 'next/image';
import heroImage from '../../public/images/hero.jpg';
import ShareButton from "../../components/ShareButton";
import Papa from 'papaparse';
import { useTable } from 'react-table';




export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}



export default function Post({ postData }) {
  const keyWordsArray = postData.keyWords.split(',');
  // const keyWordsDifficultyArray = postData.keyWordsDifficulty.split(',');
  // Generate unique IDs for headings in the content
  useEffect(() => {
    const content = document.getElementById('post-content');
    if (content) {
      const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        const text = heading.textContent;
        const id = text.toLowerCase().replace(/\s+/g, '-');
        heading.id = id;
      });
    }
  }, []);


  // Function to handle smooth scrolling when clicking on index links
  const scrollToHeading = (event, headingId) => {
    event.preventDefault();
    const headingElement = document.getElementById(headingId);
    if (headingElement) {
      headingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = () => {
    // This will calculate how many pixels the page is vertically
    const winScroll = document.documentElement.scrollTop;
    // This is responsible for subtracticing the total height of the page - where the users page is scrolled to
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    // This will calculate the final total of the percentage of how much the user has scrolled.
    const scrolled = (winScroll / height) * 100;
    console.log('scrollTop:', scrolled); // Add this line for debugging


    setScrollTop(scrolled);
  };


  useEffect(() => {
    // Fires when the document view has been scrolled
    window.addEventListener("scroll", onScroll);

    // 
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // for keyword table
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Define the CSV file path
    const csvFilePath = '/images/keywords.csv';

    Papa.parse(csvFilePath, {
      download: true,
      header: true,
      complete: (result) => {
        const firstThreeColumns = result.data.map((row) => ({
          Keyword: row['Keyword'],
          Volume: row['Volume'],
          KeywordDifficulty: row['Keyword Difficulty'],
        }));
        setData(firstThreeColumns);

        // Create columns for the table
        if (firstThreeColumns.length > 0) {
          const columnNames = Object.keys(firstThreeColumns[0]);
          const columns = columnNames.map((columnName) => ({
            Header: columnName,
            accessor: columnName,
          }));
          setColumns(columns);
        }
      },
    });
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });



  return (
    <>
      <div className={utilStyles.progressMainWrapper}>
        <div
          className={utilStyles.progressMainStyle}
          style={{ width: `${scrollTop}%` }}
        ></div>
      </div>
      <Layout>

        <Head>
          <title>{postData.title}</title>
        </Head>
        <article>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
            <h3>Written By : {postData.author}</h3>
          </div>
          <div style={{ color: "red" }}>
            <div>Reading time: {(postData.wordCount / 225).toFixed(1)} mins</div>
          </div>
          <p>Recommended Image alt text for SEO: (Tresmode women sandal showcase banner and hero image )</p>
           <p>(These are sample images. If you have high quality photoshoots of {postData.author} products, you can use those images instead)</p>
          <Image
            src={heroImage}
            alt="Tresmode sandal showcase banner and hero image" 
            layout="intrinsic"
            />
            
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <ShareButton />
          
          {/* Index containing all headings */}
          <p>----------------------------------------------------------</p>
          We analysed your competitors and chose keywords that are easy to rank for and have high volume.
          <p>Competitors: {postData.Competitors}</p>
          <p>Keyword Intent of Competitors: {postData.keyWordsIntent}</p>
          <p>----------------------------------------------------------</p>
          <div>Selected keywords: {postData.keyWords} </div>
          <p>--------------------------------------------------------------</p>
          <div style={{ color: "green" }}>

            <div>Ideal SEO Title length for Selected keywords: {postData.idealTitleLen}</div>
            <div>Actual Title length: {postData.titleLen}</div>
          </div>
          <table {...getTableProps()} className={utilStyles.table}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

          <div>
            <h2>Table of Contents</h2>
            <ul>
              {postData.headings.map((heading) => (
                <li key={heading.text}>
                  <a
                    href={`#${heading.slug}`}
                    onClick={(e) => scrollToHeading(e, heading.slug)}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Post content with an ID */}
          <div style={{ color: "green" }}>
            <i>
              <div>Ideal word Count range for targeted keywords : {postData.keyWords} is {postData.idealWordCount}</div>
              <br></br>
              <div>Actual word count for this article is : {postData.wordCount}</div>
            </i>
          </div>
          <div id="post-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
          <GuidelinesTable />
        </article>
      </Layout>
    </>
  );
}


export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}