// import React, { createContext, useState, useContext } from 'react';

// const FlagContext = createContext<any>(null);

// export const FlagProvider = ({ children }: { children: React.ReactNode }) => {
//     const [flag, setFlag] = useState(false);

//     return (
//         <FlagContext.Provider value={{ flag, setFlag }}>
//             {children}
//         </FlagContext.Provider>
//     );
// };

// export const useFlag = () => useContext(FlagContext);