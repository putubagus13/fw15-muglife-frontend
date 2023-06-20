import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { IoIosArrowForward } from 'react-icons/io';
import { IoPencilSharp } from 'react-icons/io5';
import { FiUser } from 'react-icons/fi';
import cookieConfig from '@/helpers/cookieConfig';
import checkCredentials from '@/helpers/checkCredentials';
import { withIronSessionSsr } from 'iron-session/next';
import http from '@/helpers/http.helper';
import moment from 'moment/moment';
import { Formik, Field } from 'formik';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { setProfile } from '@/redux/reducers/profile';

export const getServerSideProps = withIronSessionSsr(async function getServerSideProps({ req, res }) {
    const token = req.session?.token;
    checkCredentials(token, res, '/auth/login');
    return {
        props: {
            token,
        },
    };
}, cookieConfig);

function Profile({ token }) {

    const profile = useSelector(state=>state.profile.data)
    const dispatch = useDispatch()
    const fullname = profile?.fullName;
    let nameLength;
    let firstName;
    let lastName;
    if(fullname){
        nameLength = fullname.split(" ");
        firstName = nameLength[0];
        lastName = nameLength.slice(1).join(" ");
    }

    // const [editFullname, setEditFullname] = React.useState(false);
    // const [editUsername, setEditUsername] = React.useState(false);
    // const [editEmail, setEditEmail] = React.useState(false);
    // const [editphoneNumber, setEditphoneNumber] = React.useState(false);
    // const [editGender, setEditGender] = React.useState(false);
    // const [editAddress, setEditAddress] = React.useState(false);
    // const [editbirthDate, setEditbirthDate] = React.useState(false);
    const [editContacts, setEditContacts] = React.useState(false);
    const [editDetails, setEditDetails] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [pictureURI, setPictureURI] = React.useState("");
    const [selectedPicture, setSelectedPicture] = React.useState({});

    const doEditContact = () => {
        setEditContacts(!editContacts);
    };
    const doEditDetail = () => {
        setEditDetails(!editDetails);
    };

    const fileToDataUrl = (file) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setPictureURI(reader.result);
        });
        reader.readAsDataURL(file);
    };
    
    const changePicture = (e) => {
        const file = e.target.files[0];
        setSelectedPicture(file);
        fileToDataUrl(file);
    };

    const doEditPicture = async (values) => {
        let fullName;
        if(values.lastName === ""){
            fullName = values.firstName;
        }else{
            fullName = values.firstName + " " + values.lastName;
        }
        console.log(fullName)
        const form = new FormData();
        Object.keys(values).forEach((key) => {
            if (values[key]) {
                form.append(key, values[key]);
            }
        });
        form.append("fullName", fullName)

        if(selectedPicture) {
            form.append("picture", selectedPicture);
        }
        if(token) {
            const { data } = await http(token).patch("/profile", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(data)
            dispatch(setProfile(data.results));
            setPictureURI("");
            setEditContacts(false)
            setEditDetails(false)
        }
    };

    const openModal = () => {
        if (modalOpen === true) {
            setModalOpen(false);
            setTimeout(() => {
                setModalOpen(true);
            }, 200);
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>
            <Head>
                <title>User Profile</title>
            </Head>
            <Header token={token} />
            <main className="pt-28">
                <Formik
                    initialValues={{
                        lastName: lastName || '',
                        firstName: firstName || '',
                        username: profile?.username || '',
                        email: profile?.email || '',
                        phoneNumber: profile?.phoneNumber,
                        gender: profile?.gender ? '1' : '0',
                        address: profile?.address || '',
                        birthDate: profile?.birthDate && moment(profile.birthDate).format('YYYY/MM/DD') || '',
                    }}
                    onSubmit={doEditPicture}
                    enableReinitialize
                >
                    {({ handleSubmit, handleChange, handleBlur, errors, touched, values }) => (
                        <>
                        <form onSubmit={handleSubmit} className="w-full bg-profile-pattern bg-no-repeat bg-cover py-16 px-7 lg:px-36 xl:px-64">
                            <div className="w-full mb-11">
                                <div className="w-72 text-4xl text-white font-semibold capitalize ">User Profile</div>
                            </div>
                            <div className="w-full flex flex-col md:flex-row items-start justify-between gap-7 xl:gap-16">
                                <div className="w-full md:basis-4/12">
                                    <div className="w-full rounded-2xl bg-accent pb-4">
                                        <div className="w-full flex flex-col items-center justify start gap-5 px-5 md:px-11 py-12 rounded-t-2xl  bg-white">
                                            <div className="relative w-24 h-24">
                                                <label className="cursor-pointer absolute bottom-0 right-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                                                {!pictureURI ? (
                                                    <input
                                                        name="picture"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={changePicture}
                                                    />
                                                    ) : null}
                                                    <IoPencilSharp size={13} className="text-white" />
                                                </label>
                                                <div className="w-24 h-24 overflow-hidden rounded-full flex justify-center items-center">
                                                {pictureURI && <>
                                                    <Image className="object-fit" src={pictureURI} width={150} height={150} alt=""/>
                                                </>}
                                                {!pictureURI && <>
                                                    {profile?.picture === null ? <FiUser size={100} /> : <Image src={profile?.picture} width={96} height={96} alt="" />}
                                                </>}
                                                </div>
                                            </div>
                                            <div className="w-full flex flex-col items-center justify-center">
                                                <div className="h-full flex items-center justify-center text-primary text-lg font-semibold">{profile.fullName}</div>
                                                <div className="h-full flex items-center justify-center text-primary text-sm">{profile.email}</div>
                                            </div>
                                            <div className="w-full flex flex-col items-center justify-center pt-7">
                                                <div className="w-full flex items-center justify-center text-primary text-mg">Has been ordered {profile.orderedId === null ? '0' : profile.orderedId} product</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:basis-4/6">
                                    <div className="w-full rounded-2xl  bg-accent pb-4">
                                        <div className="relative w-full flex flex-col items-start justify-start gap-7 px-5 md:px-11 py-11 rounded-t-2xl  bg-white">
                                            <label onClick={doEditContact} className="absolute top-7 right-7 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                <IoPencilSharp size={20} className="text-white" />
                                            </label>
                                            <div className="text-primary text-xl font-semibold">Contacts</div>
                                            <div className="w-full flex flex-col md:flex-row items-start justify-between gap-7">
                                                <div className="flex-1 w-full flex flex-col items-start justify-between gap-7">
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Email Address :</div>
                                                        {!editContacts &&  <div className="text-primary">{profile.email}</div>}
                                                        {editContacts &&
                                                        <input 
                                                            onChange={handleChange} 
                                                            onBlur={handleBlur} 
                                                            value={values.email} 
                                                            type="email"
                                                            name= "email"
                                                            className="outline-none text-primary" />
                                                        }
                                                    </div>
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Delivery Address:</div>
                                                        {!editContacts && <div className="text-primary">{profile.address}</div>}
                                                        {editContacts && <input 
                                                            onChange={handleChange} 
                                                            onBlur={handleBlur} 
                                                            value={values.address} 
                                                            type="text" 
                                                            name="address"
                                                            className="outline-none text-primary" 
                                                        />}
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full flex flex-col items-start justify-start gap-7">
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Mobile Number :</div>
                                                        {!editContacts && <div className="text-primary">{profile.phoneNumber}</div>}
                                                        {editContacts && 
                                                            <input onChange={handleChange} 
                                                            onBlur={handleBlur} 
                                                            value={values.phoneNumber}
                                                            name="phoneNumber"
                                                            type="number"
                                                            className='outline-none text primary' />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col md:flex-row items-start justify-between gap-7 xl:gap-16 mt-16">
                                <div className="w-full md:basis-4/6">
                                    <div className="w-full min-h-[350px] rounded-2xl  bg-accent pb-4">
                                        <div className="relative w-full h-[96%] flex flex-col items-start justify-start gap-5 px-5 md:px-11 py-11 rounded-t-2xl  bg-white">
                                            <label onClick={doEditDetail} className="absolute top-7 right-7 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                <IoPencilSharp size={20} className="text-white" />
                                            </label>
                                            <div className="text-primary text-xl font-semibold">Details</div>
                                            <div className="w-full flex flex-col md:flex-row items-start justify-between gap-7">
                                                <div className="flex-1 w-full flex flex-col items-start justify-between gap-7">
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Display Names :</div>
                                                        <div className="text-primary">{profile.fullName}</div>
                                                    </div>
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Fisrt Name:</div>
                                                        {!editDetails ? 
                                                            <div className="text-primary">{firstName}</div> :
                                                            <input 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur} 
                                                                value={values.firstName} 
                                                                type="text" 
                                                                name="firstName"
                                                                className="outline-none text-primary" />
                                                        }
                                                    </div>
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">Last Name:</div>
                                                        {!editDetails ? 
                                                            <div className="text-primary">{lastName}</div> :
                                                            <input 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur}
                                                                value={values.lastName} 
                                                                type="text" 
                                                                name="lastName"
                                                                className="outline-none text-primary" 
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full flex flex-col items-start justify-start gap-7">
                                                    <div className="flex w-full flex-col items-start gap-3 border-b border-primary">
                                                        <div className="text-lg text-accent">DD/MM/YY</div>
                                                        {!editDetails ? 
                                                            <div className="text-primary">{profile.birthDate === null ? '-' : moment(profile.birthDate).format('DD/MM/YY')}</div> :
                                                            <input 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur} 
                                                                value={values.fullName} 
                                                                type="date" 
                                                                className="outline-none text-primary" />
                                                        }
                                                    </div>
                                                    <div className="flex w-full flex-col items-start gap-3 ">
                                                        <div className="text-lg text-primary flex items-center gap-3">
                                                            {!editDetails && <input 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur} 
                                                                type="radio" 
                                                                name="gender" 
                                                                id="genChoiceMale" 
                                                                value={profile?.gender} />}
                                                            {editDetails && <input 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur} 
                                                                type="radio" 
                                                                name="gender" 
                                                                id="genChoiceMale" 
                                                                value="0" />}
                                                            <label htmlFor="genChoiceMale">
                                                                Male
                                                            </label>
                                                        </div>
                                                        <div className="text-lg text-primary flex items-center gap-3">
                                                            {!editDetails && <input 
                                                                onChange={handleChange} 
                                                                    onBlur={handleBlur} 
                                                                    type="radio" name="gender" 
                                                                    id="genChoiceFem" 
                                                                    value={profile?.gender} />}
                                                            {editDetails && <input 
                                                                onChange={handleChange} 
                                                                    onBlur={handleBlur} 
                                                                    type="radio" name="gender" 
                                                                    id="genChoiceFem" 
                                                                    value="1" />}
                                                            <label htmlFor="genChoiceFem">
                                                                Female
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:basis-4/12">
                                    <div className="w-full min-h-[350px] rounded-2xl ">
                                        <div className="w-full flex flex-col items-center justify-between gap-5 px-5 rounded-t-2xl">
                                            <div className="w-full text-center text-lg text-white font-semibold">Do you want to save the change?</div>
                                            <div className="w-full flex flex-col items-center justify-center">
                                                <button type="submit" className="w-full btn btn-secondary text-white capitalize rounded-xl">
                                                    Save Changes
                                                </button>
                                            </div>
                                            <div className="w-full flex flex-col items-center justify-center">
                                                <button type="reset" className="w-full btn btn-accent text-primary capitalize rounded-xl">
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="w-full flex flex-col items-center justify-center mt-7">
                                                <button
                                                    type="button"
                                                    onClick={()=>openModal()}
                                                    className="w-full btn btn-neutral text-primary capitalize rounded-xl flex items-center justify-between"
                                                >
                                                    Edit Password <IoIosArrowForward />{' '}
                                                </button>
                                            </div>
                                            <div className="w-full flex flex-col items-center justify-center">
                                                <Link href="/api/logout" className="w-full btn btn-neutral text-primary capitalize rounded-xl flex items-center justify-between">
                                                    Logout <IoIosArrowForward />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        </>
                    )}
                </Formik>
            </main>
            <Footer />
            {modalOpen && <ChangePasswordModal token={token} />}
        </>
    );
}

export default Profile;
