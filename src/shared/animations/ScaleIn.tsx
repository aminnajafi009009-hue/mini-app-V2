import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleInProps{
    children:ReactNode;
    delay?:number;
}

export default function ScaleIn({
    children,
    delay=0
}:ScaleInProps){

    return(

        <motion.div

        initial={{
            opacity:0,
            scale:.92
        }}

        animate={{
            opacity:1,
            scale:1
        }}

        transition={{
            delay,
            duration:.35,
            ease:[0.22,1,0.36,1]
        }}

        >

        {children}

        </motion.div>

    )

}
