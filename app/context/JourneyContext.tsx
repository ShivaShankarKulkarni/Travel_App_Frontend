import React, { createContext, useState, useContext } from "react";

interface JourneyContextType {
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider = ({ children }: { children: React.ReactNode }) => {
  const [refresh, setRefresh] = useState(false);

  return (
    <JourneyContext.Provider value={{ refresh, setRefresh }}>
      {children}
    </JourneyContext.Provider>
  );
};  

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
};
