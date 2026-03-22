"use client";

import { z } from "zod";
import { Virtualbox } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";


const formSchema = z.object({
    name: z.string().min(1).max(16),
    visibility: z.enum(["public", "private"]),
})


export default function EditVirtualboxModal({
    open,
    setOpen,
    data
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: Virtualbox;
}) {

    const [loading,setLoading]=useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: data.name,
            visibility: data.visibility,
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Virtualbox Info</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="My Project" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="visibility" render={({ field }) => (
                            <FormItem className="mb-8">
                                <FormLabel>Visibility</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                         <Button disabled={loading} type="submit" className="w-full">
                        {loading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                            </>
                        ) : (
                        "Submit"
                        )}
                    </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}