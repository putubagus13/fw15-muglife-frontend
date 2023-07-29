import React from 'react';
import Image from 'next/image';
import search from '../../assets/search.png';
import moment from 'moment';
import Footer from '../../components/Footer';
import { RiCheckDoubleFill } from 'react-icons/ri';
import Navbar from '../../components/Header';
import cookieConfig from '@/helpers/cookieConfig';
import { withIronSessionSsr } from 'iron-session/next';
import checkCredentials from '@/helpers/checkCredentials';
import http from '@/helpers/http.helper';
import { useSelector } from 'react-redux';
import { LuMessagesSquare } from 'react-icons/lu';
import User from '@/assets/user.png';
import { IoMdSend } from 'react-icons/io';
import { Formik } from 'formik';

export const getServerSideProps = withIronSessionSsr(async function getServerSideProps({ req, res }) {
  const token = req.session?.token;
  checkCredentials(token, res, '/auth/login');
  return {
    props: {
      token,
    },
  };
}, cookieConfig);



const RoomChatAdmin = ({token}) => {
  const profile = useSelector(state => state.profile.data);
  const userId = profile.user_id;
  const [conversations, setConversations] =  React.useState([]);
  const [conversationsReplies, setConversationsReplies] =  React.useState([]);
  const [activeConversation, setActiveConversation] = React.useState('');
  const [userSender, setUserSender] = React.useState('');
  const [userSenderId, setUserSenderId] = React.useState('');
  

  const getConversations = React.useCallback(async() => {
    const {data} =  await http(token).get('/chat');
    if(data){
      setConversations(data.results);
    }
  },[token]);

  const getConversationReplies = React.useCallback(async(conversationId) => {
    const conversation_id = conversationId;
    const {data} =  await http(token).get('/chat/conversation', {params:{conversation_id}});
    setConversationsReplies(data?.results);
  },[token]);

  const doShowConversation = (conversationId, userSender, userSenderId) => {
    setActiveConversation(conversationId);
    getConversationReplies(conversationId);
    setUserSender(userSender);
    setUserSenderId(userSenderId);
    getConversations();
  };

  const sendMessage = async (values, {resetForm}) => {
    try {
      if(values.message_content){
        const form = new URLSearchParams({
          conversation_id: activeConversation,
          message_content: values.message_content,
          sender_id: userSenderId
        }).toString();
        const {data} = await http(token).post('/chat/send', form);
        if(data){
          console.log(data.results.conversation_id);
          getConversationReplies(data.results.conversation_id);
          resetForm();
          getConversations();

        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    getConversations();
  },[getConversations]);
  return (
    <>
      <title>Room Chat | MugLife</title>
      <Navbar token={token} />
      <div className="pt-[100px] font-poppins">
        <div className="lg:bg-[url('../assets/background-chat.png')] bg-cover bg-no-repeat pb-[89px]">
          <div className="lg:pt-[84px] lg:px-[200px] lg:flex ">
            <div className=" py-[60px] px-3 lg:px-[50px]  bg-[#553b2e] lg:rounded-l-[20px]">
              <div className="border-1 flex items-center bg-white py-[18px] pl-[35px] pr-[40px] rounded-[30px] mb-[43px]">
                {search && <Image src={search} alt="search" className="mr-[14px]" />}
                <input
                  placeholder="Search Chat"
                  className="focus:outline-none"
                />
              </div>
              <p className="text-[14px] font-bold mb-[43px] pl-[30px] text-white">
                Click a conversation to start a chat
              </p>
              { 
                conversations.map(items => (
                  <div className="flex gap-4 mb-[20px] text-white" key={`conversation-id-${items?.conversationId}`}>
                    {
                      items?.user_1 !== userId ?  (
                        items?.picture_1 ?
                          (<Image
                            width={80}
                            height={80}
                            src={items?.picture_1}
                            alt="zulaikha"
                            className="w-[80px] h-[80px] mr-[14px] rounded-[50%]"
                          />):(<Image width={80} height={80} className="object-cover w-[80px] h-[80px]" src={User} alt="user"/>)
                      ) : (
                        items?.picture_2 ?
                          (<Image
                            width={80}
                            height={80}
                            src={items?.picture_2}
                            alt="zulaikha"
                            className="w-[80px] h-[80px] mr-[14px] rounded-[50%]"
                          />) : (<Image width={80} height={80} className="object-cover w-[80px] h-[80px]" src={User} alt="user"/>)
                      )
                    }
                    <div>
                      <button onClick={() => doShowConversation(items?.conversationId, items?.user_1 !== userId ? items?.fullName_1 : items?.fullName_2, items?.user_1 !== userId ? items?.user_1 : items?.user_2)} className="text-[20px] font-bold mb-[10px] capitalize">{
                        items?.user_1 !== userId ? items?.fullName_1 : items?.fullName_2
                      }
                      
                      </button>
                      <p className="w-[210px] text-[15px]">
                        {items?.last_message}
                      </p>
                    </div>
                  </div>
                ))
              }
              <hr className="mb-[78px]" />
              <div>
                <p className="text-[15px] text-center text-white">
                  You have no conversation, start chat other staff! Have a good
                  day!
                </p>
              </div>
            </div>
            <div className="bg-white px-[36px] py-[28px] lg:w-[1133px] rounded-r-[20px] h-[900px]">
              {
                !activeConversation && (
                  <div className="mb-[50px] h-[80%] flex flex-col gap-11 justify-center items-center">
                    <div>
                      <LuMessagesSquare size={65}/>
                    </div>
                    <p className='w-[400px] text-center text-xl font-medium tracking-tighest'>
                      send a message to know more about muglife products and get the best offers from us
                    </p>
                  </div>
                )
              }
              {
                activeConversation && (
                  <>
                    <p className="text-[#3C2A21] text-[30px] font-bold leading-[45px] mb-[70px] capitalize">
                      {userSender}
                    </p>
                    <div className="mb-[20px] h-[70%] overflow-scroll scrollbar-hide">
                      {conversationsReplies && conversationsReplies.map(items => (
                        <>
                          <div className={`flex ${items?.user_id !== userId ? 'flex-row-reverse' : 'flex-row'} items-center justify-between mb-[20px] h-16`} key={`conversation-replies-admin-${items?.id}`}>
                            <div className={`w-[86px] h-full flex ${items?.user_id !== userId ? 'flex-row-reverse justify-start items-center gap-2' : 'flex-row justify-center items-center gap-2'}`}>
                              {
                                items?.user_id === userId && (
                                  <div>
                                    <RiCheckDoubleFill className="text-[#3C2A21]" />
                                  </div>
                                )
                              }
                              <div className="text-[#9F9F9F] text-xs leading-[15px] mr-[12px] flex-1">
                                {moment(items?.createdAt).format('LT')}
                              </div>
                            </div>
                            <div className={`flex ${items?.user_id !== userId ? 'justify-start pl-2' :'justify-end'} items-center w-[calc(100%-150px)] pr-2`}>
                              <div className="text-[#3C2A21] text-base leading-[22px]">
                                {items?.message_content}
                              </div>
                            </div>
                            <div className='w-[64px] h-full flex justify-center items-center'>
                              {
                                items?.picture ? (
                                  <Image
                                    height={55}
                                    width={55}
                                    src={items?.picture}
                                    alt="man"
                                    className="w-[55px] h-[55px] rounded-[50%]"
                                  />
                                ):(
                                  <Image
                                    height={55}
                                    width={55}
                                    src={User}
                                    alt="man"
                                    className="w-[55px] h-[55px] rounded-[50%]"
                                  />
                                )
                              }
                            </div>
                          </div>
                          <hr className="mb-5" />
                        </>
                      ))}
                    </div>
                  </>
                )
              }
              {
                activeConversation && (
                  <div className="pb-[-56px]">
                    <Formik
                      initialValues={{ 
                        message_content:''
                      }}
                      onSubmit={sendMessage}
                    >
                      {({handleChange, handleBlur, handleSubmit, values}) => (
                        <form onSubmit={handleSubmit} className="border-1 bg-[#E5E5CB] py-[23px] px-[36px] flex rounded-[20px]">
                          <input
                            type="text"
                            name="message_content"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.message_content}
                            placeholder="Type a message..."
                            className="focus:outline-none bg-[#E5E5CB] text-[#3C2A21] flex-1"
                          />
                          <button type='submit'>
                            <IoMdSend size={35} className='text-black'/>
                          </button>
                        </form>
                      )}
                    </Formik>
                  </div>
                )
              }
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default RoomChatAdmin;