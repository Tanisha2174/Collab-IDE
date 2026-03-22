
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/editor/navbar";
import { R2Files, User, UsersToVirtualboxes, Virtualbox } from "@/lib/types";
import { TFile, TFolder } from "@/components/editor/sidebar/types";
import dynamic from "next/dynamic";
import EditorClientLoader from "./editor-client-loader";



const getUserData=async (id:string)=>{
  const res = await fetch(
    `https://database.tpanesar2174.workers.dev/api/user?id=${id}`
  );
  const userData = (await res.json()) as User;
  return userData;
}

const getVirtualboxData= async (id:string)=>{
  const virtualboxRes= await fetch(`https://database.tpanesar2174.workers.dev/api/virtualbox?id=${id}`);
  const virtualboxData : Virtualbox= await virtualboxRes.json();
  return virtualboxData;
}

const getSharedUsers= async(usersToVirtualboxes: UsersToVirtualboxes[])=>{
  const shared= await Promise.all(
    usersToVirtualboxes.map(async (user)=>{
      const userRes= await fetch(`https://database.tpanesar2174.workers.dev/api/user?id=${user.id}`);
      const userData: User = await userRes.json()
      return {id:userData.id,name:userData.name}
    })
  );
  return shared;
}

export default async function Home({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const virtualboxId= await params.id;
  if (!user) redirect("/");

  
  const userData = await getUserData(user.id);
  const virtualboxData= await getVirtualboxData(virtualboxId);
  const shared= await getSharedUsers(virtualboxData.usersToVirtualboxes ?? [])

  return (
    <div className="flex w-screen flex-col h-screen bg-background">
      <Navbar userData={userData} virtualboxData={virtualboxData} shared={shared}/>
      <div className="w-screen flex grow">
        <EditorClientLoader userId={user.id} virtualboxId={virtualboxId}/>
      </div>
    </div>
  );
}

