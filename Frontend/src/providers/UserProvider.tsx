import React, { createContext, FC, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios, { AxiosError } from "axios";

const HOST = import.meta.env.VITE_HOST;

interface User {
    email: string;
}

interface UserContextType {
    users: User[];
    addUser: (email: string) => void;
    fetchUsers: () => void;
}

const initialData: UserContextType = {
    users: [],
    addUser: () => {},
    fetchUsers: () => {}
};

export const UserContext = createContext(initialData);

interface UserProviderProps {
    children: React.ReactNode;
}

const UserProvider: FC<UserProviderProps> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = () => {
        const storedUsers = JSON.parse(localStorage.getItem("addedUsers") || "[]");
        setUsers(storedUsers);
    };

    const addUser = async (email: string) => {
        try {
            const options = {
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token") || ""
                }
            };
            const response = await axios.post(`${HOST}/api/user/add`, { email }, options);
            toast.success(response.data.message);
            
            const updatedUsers = [...users, { email }];
            setUsers(updatedUsers);
            localStorage.setItem("addedUsers", JSON.stringify(updatedUsers));
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message: string }>;
                if (axiosError.response && axiosError.response.data) {
                    toast.error(axiosError.response.data.message);
                } else {
                    toast.error("An error occurred");
                }
            } else {
                toast.error("An error occurred");
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider value={{ users, addUser, fetchUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
