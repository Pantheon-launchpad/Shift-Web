import {  motion } from "framer-motion"

const App = () => {
  return (
    <div className='bg-black text-purple-900 text-5xl text-center flex justify-center
    h-screen items-center font-bold'>
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{  opacity: 1,  scale: 1}}
        transition={{ duration: 0.8,  ease: 'easeInOut'}}
>
  
Welcome to Shift-web
</motion.h1>
    </div>
  )
}

export default App
