/* eslint-disable @typescript-eslint/no-explicit-any */
// AccountContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type AccountContextType = {
  contactId: string | null;
  accountId: string | null;
  loadingAuth: boolean;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contactId, setContactId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAuth, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const catalyst = (window as any).catalyst;
        const userManagement = catalyst.userManagement;
        const currentUserPromise = userManagement.getCurrentProjectUser();
        currentUserPromise
          .then((response) => {
            const Email = response.content.email_id;
            const zcql = catalyst.ZCatalystQL;
            const query = `Select IdMapping.ContactId, IdMapping.AccountId FROM IdMapping where IdMapping.Email = '${Email}'`;
            const zcqlPromise = zcql.executeQuery(query);
            zcqlPromise
              .then((response) => {
                const content = response.content[0].IdMapping;
                setContactId(content.ContactId);
                setAccountId(content.AccountId);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.error("Failed to fetch accountId", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountId();
  }, []);

  return (
    <AccountContext.Provider value={{ contactId, accountId, loadingAuth }}>
      {children}
    </AccountContext.Provider>
  );
};

// Custom hook for easy usage
export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context)
    throw new Error("useAccount must be used within AccountProvider");
  return context;
};
