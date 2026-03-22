"use server"

import { revalidatePath } from "next/cache"

export async function createVirtualbox(body:{
    type:string
    name:string
    visibility: string
}){
    const res=await fetch("https://database.tpanesar2174.workers.dev/api/virtualbox",{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body),
    })
    return await res.text();
}

export async function deleteVirtualbox(id:string){
    const res=await fetch(`https://database.tpanesar2174.workers.dev/api/virtualbox?id=${id}`,{
        method:"DELETE",
    })
    revalidatePath("/dashboard");
}

export async function updateVirtualbox(body:{
    id:string
    name?:string
    visibility?: "public" | "private"
}){
    const res=await fetch("https://database.tpanesar2174.workers.dev/api/virtualbox",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body),
    })
    revalidatePath("/dashboard");
}


export async function shareVirtualbox(
    virtualboxId: string,
    email:string
){
    try{
        const res=await fetch("https://database.tpanesar2174.workers.dev/api/virtualbox/share",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({virtualboxId,email}),
        })

        const text=await res.text()
        if(res.status!==200){
            return {succes:false,message:text};
        }
        revalidatePath(`/code/${virtualboxId}`);
        return {success:true ,message:"Shared successfully"};
    } catch(err){
        return {success:false , message: err};
    }

}


 