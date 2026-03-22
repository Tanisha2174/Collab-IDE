
export const renameFile=async(
    fileId:string,
    newFileId:string,
    data:string,
)=>{

    const res= await fetch(`https://storage.tpanesar2174.workers.dev/api/rename`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            fileId,
            newFileId,
            data,
        }),  
    });

    console.log(res);
    return res.ok;
}


export const saveFile=async(
    fileId:string,
    data:string,
)=>{

    const res= await fetch(`https://storage.tpanesar2174.workers.dev/api/save`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            fileId,
            data,
        }),  
    });

    return res.ok;
}


export const createFile=async(
    fileId:string
)=>{

    const res= await fetch(`https://storage.tpanesar2174.workers.dev/api`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            fileId
        }),  
    });

    return res.ok;
}

export const deleteFile=async(
    fileId:string
)=>{

    const res= await fetch(`https://storage.tpanesar2174.workers.dev/api`,{
        method:"DELETE",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            fileId
        }),  
    });

    return res.ok;
}