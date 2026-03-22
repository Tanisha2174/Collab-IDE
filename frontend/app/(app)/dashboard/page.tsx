
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard";
import Navbar from "@/components/dashboard/navbar";
import { User, Virtualbox } from "@/lib/types";




export default async function DashboardPage(){
    const user=await currentUser();
    if(!user){
        redirect("/");
    }

    const UserRes=await fetch(`https://database.tpanesar2174.workers.dev/api/user?id=${user.id}`);
    const userData=(await UserRes.json()) as User;
 
    return (
        <div>
            <Navbar userData={userData}/>
            <Dashboard virtualboxes={userData.virtualbox}/>
        </div>
    )
}