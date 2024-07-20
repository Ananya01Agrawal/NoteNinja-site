import { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

const HOST = import.meta.env.VITE_HOST;

const formSchema = z.object({
    email: z.string().email('Enter a valid Email Address')
});

type AddUserFormValues = z.infer<typeof formSchema>

interface ErrorResponse {
    message: string;
}

const AddUserForm = () => {

    const [loading, setLoading] = useState(false)

    const form = useForm<AddUserFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (data: AddUserFormValues) => {
        try {
            setLoading(true)
            const options = {
                headers: {
                    "Content-Type": "application/json",
                    "Login-token": localStorage.getItem("token") || "",
                }
            }
            const res = await axios.post(`${HOST}/api/user/add`, data, options)

            toast.success(res.data.message)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response && axiosError.response.data) {
                    toast.error(axiosError.response.data.message);
                } else {
                    toast.error('An error occurred');
                }
            } else {
                toast.error('An error occurred');
            }
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className='container max-w-4xl py-4 mx-auto md:py-10'>
            <Heading title="Add User" description='Add a new user by entering their email address' />
            <Separator className='mt-4 mb-8' />
            <div className='max-w-lg mx-auto'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            disabled={loading}
                                            placeholder='Email'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={loading}
                            type="submit"
                        >
                            Add User
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default AddUserForm
