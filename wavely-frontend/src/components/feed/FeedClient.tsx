'use client';

import { fetchFeed, resetFeed } from '@/store/slices/postSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../shared/Navbar';
import Spinner from '../shared/Spinner';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function FeedClient() {
  useAuthInit();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { posts, isLoading, hasMore, nextCursor } = useAppSelector((s) => s.posts);
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.replace('/login');
  }, [router]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(resetFeed());
      dispatch(fetchFeed(null));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && nextCursor) {
          dispatch(fetchFeed(nextCursor));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [dispatch, hasMore, isLoading, nextCursor]);

  if (!user) return <Spinner />;

  return (
    <div className={`_layout _layout_main_wrapper${darkMode ? ' _dark_wrapper' : ''}`}>
      {/* Dark mode switch */}
      <div className="_layout_mode_swithing_btn">
        <button type="button" className="_layout_swithing_btn_link" onClick={() => setDarkMode((v) => !v)}>
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round"></div>
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z" />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05" />
            </svg>
          </div>
        </button>
      </div>

      <div className="_main_layout">
        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">

              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item _explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                              <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
                            </svg>Learning
                          </a>
                          <span className="_left_inner_area_explore_link_txt">New</span>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972zm0 1.395H6.988c-2.37 0-3.883 1.774-3.883 4.498v8.214c0 2.727 1.507 4.498 3.883 4.498h7.972c2.375 0 3.883-1.77 3.883-4.498V7.893c0-2.727-1.508-4.498-3.883-4.498zM7.036 9.63c.323 0 .59.263.633.604l.005.094v6.382c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-6.382c0-.385.286-.697.638-.697zm3.97-3.053c.323 0 .59.262.632.603l.006.095v9.435c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094V7.274c0-.386.286-.698.638-.698zm3.905 6.426c.323 0 .59.262.632.603l.006.094v3.01c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-3.01c0-.385.286-.697.638-.697z" />
                            </svg>Insights
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0-.38.258-.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
                            </svg>Find friends
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                              <path fill="#666" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46zm0 1.448h-5.46c-2.191 0-3.295.948-3.295 2.986V20.32c0 .044.01.088 0 .07l.034.063c.059.09.17.12.247.074l5.11-3.138c.38-.23.84-.23 1.222.001l5.124 3.128a.252.252 0 00.114.035.188.188 0 00.14-.064.236.236 0 00.058-.157V6.258c0-1.9-1.132-2.81-3.294-2.81zm.386 4.869c.357 0 .646.324.646.723 0 .367-.243.67-.559.718l-.087.006H7.81c-.357 0-.646-.324-.646-.723 0-.367.243-.67.558-.718l.088-.006h6.28z" />
                            </svg>Bookmarks
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>Groups
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path fill="#666" d="M12.616 2c.71 0 1.388.28 1.882.779.495.498.762 1.17.74 1.799l.009.147c.017.146.065.286.144.416.152.255.402.44.695.514.292.074.602.032.896-.137l.164-.082c1.23-.567 2.705-.117 3.387 1.043l.613 1.043c.017.027.03.056.043.085l.057.111a2.537 2.537 0 01-.884 3.204l-.257.159a1.102 1.102 0 00-.33.356 1.093 1.093 0 00-.117.847c.078.287.27.53.56.695l.166.105c.505.346.869.855 1.028 1.439.18.659.083 1.36-.272 1.957l-.66 1.077-.1.152c-.774 1.092-2.279 1.425-3.427.776l-.136-.069a1.19 1.19 0 00-.435-.1 1.128 1.128 0 00-1.143 1.154l-.008.171C15.12 20.971 13.985 22 12.616 22h-1.235c-1.449 0-2.623-1.15-2.622-2.525l-.008-.147a1.045 1.045 0 00-.148-.422 1.125 1.125 0 00-.688-.519c-.29-.076-.6-.035-.9.134l-.177.087a2.674 2.674 0 01-1.794.129 2.606 2.606 0 01-1.57-1.215l-.637-1.078-.085-.16a2.527 2.527 0 011.03-3.296l.104-.065c.309-.21.494-.554.494-.923 0-.401-.219-.772-.6-.989l-.156-.097a2.542 2.542 0 01-.764-3.407l.65-1.045a2.646 2.646 0 013.552-.96l.134.07c.135.06.283.093.425.094.626 0 1.137-.492 1.146-1.124l.009-.194a2.54 2.54 0 01.752-1.593A2.642 2.642 0 0111.381 2h1.235zm-.613 7.732c-1.026 0-1.858.815-1.858 1.82 0 1.005.832 1.82 1.858 1.82 1.026 0 1.858-.815 1.858-1.82 0-1.005-.832-1.82-1.858-1.82z" />
                            </svg>Settings
                          </a>
                        </li>
                        <li className="_left_inner_area_explore_item _explore_item">
                          <a href="#0" className="_left_inner_area_explore_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                            </svg>Save post
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Suggested People */}
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_left_inner_area_suggest_content _mar_b24">
                        <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
                        <span className="_left_inner_area_suggest_content_txt">
                          <a className="_left_inner_area_suggest_content_txt_link" href="#0">See All</a>
                        </span>
                      </div>
                      {[
                        { name: 'Steve Jobs', role: 'CEO of Apple', img: '/assets/images/people1.png' },
                        { name: 'Ryan Roslansky', role: 'CEO of Linkedin', img: '/assets/images/people2.png' },
                        { name: 'Dylan Field', role: 'CEO of Figma', img: '/assets/images/people3.png' },
                      ].map((person) => (
                        <div className="_left_inner_area_suggest_info" key={person.name}>
                          <div className="_left_inner_area_suggest_info_box">
                            <div className="_left_inner_area_suggest_info_image">
                              <a href="#0"><img src={person.img} alt={person.name} className="_info_img1" /></a>
                            </div>
                            <div className="_left_inner_area_suggest_info_txt">
                              <a href="#0"><h4 className="_left_inner_area_suggest_info_title">{person.name}</h4></a>
                              <p className="_left_inner_area_suggest_info_para">{person.role}</p>
                            </div>
                          </div>
                          <div className="_left_inner_area_suggest_info_link">
                            <a href="#0" className="_info_link">Connect</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_left_inner_event_content">
                        <h4 className="_left_inner_event_title _title5">Events</h4>
                        <a href="#0" className="_left_inner_event_link">See all</a>
                      </div>
                      {[1, 2].map((i) => (
                        <a className="_left_inner_event_card_link" href="#0" key={i}>
                          <div className="_left_inner_event_card">
                            <div className="_left_inner_event_card_iamge">
                              <img src="/assets/images/feed_event1.png" alt="" className="_card_img" />
                            </div>
                            <div className="_left_inner_event_card_content">
                              <div className="_left_inner_card_date">
                                <p className="_left_inner_card_date_para">10</p>
                                <p className="_left_inner_card_date_para1">Jul</p>
                              </div>
                              <div className="_left_inner_card_txt">
                                <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                              </div>
                            </div>
                            <hr className="_underline" />
                            <div className="_left_inner_event_bottom">
                              <p className="_left_iner_event_bottom">17 People Going</p>
                              <button type="button" className="_left_iner_event_bottom_link">Going</button>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle — Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">

                    {/* Story section — Desktop */}
                    <div className="_feed_inner_ppl_card _mar_b16">
                      <div className="_feed_inner_story_arrow">
                        <button type="button" className="_feed_inner_story_arrow_btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
                          </svg>
                        </button>
                      </div>
                      <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                          <div className="_feed_inner_profile_story _b_radious6">
                            <div className="_feed_inner_profile_story_image">
                              <img src="/assets/images/card_ppl1.png" alt="" className="_profile_story_img" />
                              <div className="_feed_inner_story_txt">
                                <div className="_feed_inner_story_btn">
                                  <button className="_feed_inner_story_btn_link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                                      <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="_feed_inner_story_para">Your Story</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {[
                          { img: '/assets/images/card_ppl2.png', name: 'Ryan Roslansky', cls: '' },
                          { img: '/assets/images/card_ppl3.png', name: 'Ryan Roslansky', cls: '_custom_mobile_none' },
                          { img: '/assets/images/card_ppl4.png', name: 'Ryan Roslansky', cls: '_custom_none' },
                        ].map((s, i) => (
                          <div className={`col-xl-3 col-lg-3 col-md-4 col-sm-4 ${s.cls}`} key={i}>
                            <div className="_feed_inner_public_story _b_radious6">
                              <div className="_feed_inner_public_story_image">
                                <img src={s.img} alt="" className="_public_story_img" />
                                <div className="_feed_inner_pulic_story_txt">
                                  <p className="_feed_inner_pulic_story_para">{s.name}</p>
                                </div>
                                <div className="_feed_inner_public_mini">
                                  <img src="/assets/images/mini_pic.png" alt="" className="_public_mini_img" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Story section — Mobile */}
                    <div className="_feed_inner_ppl_card_mobile _mar_b16">
                      <div className="_feed_inner_ppl_card_area">
                        <ul className="_feed_inner_ppl_card_area_list">
                          <li className="_feed_inner_ppl_card_area_item">
                            <a href="#0" className="_feed_inner_ppl_card_area_link">
                              <div className="_feed_inner_ppl_card_area_story">
                                <img src="/assets/images/mobile_story_img.png" alt="" className="_card_story_img" />
                                <div className="_feed_inner_ppl_btn">
                                  <button className="_feed_inner_ppl_btn_link" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                                      <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
                            </a>
                          </li>
                          {[
                            { img: '/assets/images/mobile_story_img1.png', cls: '_feed_inner_ppl_card_area_story_active' },
                            { img: '/assets/images/mobile_story_img2.png', cls: '_feed_inner_ppl_card_area_story_inactive' },
                            { img: '/assets/images/mobile_story_img1.png', cls: '_feed_inner_ppl_card_area_story_active' },
                            { img: '/assets/images/mobile_story_img2.png', cls: '_feed_inner_ppl_card_area_story_inactive' },
                          ].map((s, i) => (
                            <li className="_feed_inner_ppl_card_area_item" key={i}>
                              <a href="#0" className="_feed_inner_ppl_card_area_link">
                                <div className={s.cls}>
                                  <img src={s.img} alt="" className="_card_story_img1" />
                                </div>
                                <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <CreatePost />

                    {posts.length === 0 && !isLoading && (
                      <div className="_feed_inner_area _b_radious6 _padd_t24 _padd_b24 text-center _mar_b16">
                        <p style={{ color: '#666' }}>No posts yet. Be the first to post!</p>
                      </div>
                    )}

                    {posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}

                    <div ref={loaderRef} style={{ height: 20 }} />
                    {isLoading && <Spinner />}

                    {!hasMore && posts.length > 0 && (
                      <p className="text-center py-3" style={{ color: '#999', fontSize: 13 }}>
                        You&apos;re all caught up!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    {/* You Might Like */}
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                        <span className="_right_inner_area_info_content_txt">
                          <a className="_right_inner_area_info_content_txt_link" href="#0">See All</a>
                        </span>
                      </div>
                      <hr className="_underline" />
                      <div className="_right_inner_area_info_ppl">
                        <div className="_right_inner_area_info_box">
                          <div className="_right_inner_area_info_box_image">
                            <a href="#0"><img src="/assets/images/Avatar.png" alt="" className="_ppl_img" /></a>
                          </div>
                          <div className="_right_inner_area_info_box_txt">
                            <a href="#0"><h4 className="_right_inner_area_info_box_title">Radovan SkillArena</h4></a>
                            <p className="_right_inner_area_info_box_para">Founder &amp; CEO at Trophy</p>
                          </div>
                        </div>
                        <div className="_right_info_btn_grp">
                          <button type="button" className="_right_info_btn_link">Ignore</button>
                          <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Your Friends */}
                  <div className="_layout_right_sidebar_inner">
                    <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_feed_top_fixed">
                        <div className="_feed_right_inner_area_card_content _mar_b24">
                          <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
                          <span className="_feed_right_inner_area_card_content_txt">
                            <a className="_feed_right_inner_area_card_content_txt_link" href="#0">See All</a>
                          </span>
                        </div>
                        <form className="_feed_right_inner_area_card_form">
                          <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                            <circle cx="7" cy="7" r="6" stroke="#666" />
                            <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                          </svg>
                          <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="input search text" aria-label="Search" />
                        </form>
                      </div>
                      <div className="_feed_bottom_fixed">
                        <div className="_feed_right_inner_area_card_ppl _feed_right_inner_area_card_ppl_inactive">
                          <div className="_feed_right_inner_area_card_ppl_box">
                            <div className="_feed_right_inner_area_card_ppl_image">
                              <a href="#0"><img src="/assets/images/people1.png" alt="" className="_box_ppl_img" /></a>
                            </div>
                            <div className="_feed_right_inner_area_card_ppl_txt">
                              <a href="#0"><h4 className="_feed_right_inner_area_card_ppl_title">Steve Jobs</h4></a>
                              <p className="_feed_right_inner_area_card_ppl_para">CEO of Apple</p>
                            </div>
                          </div>
                          <div className="_feed_right_inner_area_card_ppl_side"><span>5 minute ago</span></div>
                        </div>
                        <div className="_feed_right_inner_area_card_ppl">
                          <div className="_feed_right_inner_area_card_ppl_box">
                            <div className="_feed_right_inner_area_card_ppl_image">
                              <a href="#0"><img src="/assets/images/people2.png" alt="" className="_box_ppl_img" /></a>
                            </div>
                            <div className="_feed_right_inner_area_card_ppl_txt">
                              <a href="#0"><h4 className="_feed_right_inner_area_card_ppl_title">Ryan Roslansky</h4></a>
                              <p className="_feed_right_inner_area_card_ppl_para">CEO of Linkedin</p>
                            </div>
                          </div>
                          <div className="_feed_right_inner_area_card_ppl_side">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                              <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                            </svg>
                          </div>
                        </div>
                        <div className="_feed_right_inner_area_card_ppl">
                          <div className="_feed_right_inner_area_card_ppl_box">
                            <div className="_feed_right_inner_area_card_ppl_image">
                              <a href="#0"><img src="/assets/images/people3.png" alt="" className="_box_ppl_img" /></a>
                            </div>
                            <div className="_feed_right_inner_area_card_ppl_txt">
                              <a href="#0"><h4 className="_feed_right_inner_area_card_ppl_title">Dylan Field</h4></a>
                              <p className="_feed_right_inner_area_card_ppl_para">CEO of Figma</p>
                            </div>
                          </div>
                          <div className="_feed_right_inner_area_card_ppl_side">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                              <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
