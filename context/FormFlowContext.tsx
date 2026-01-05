"use client"
import React, { createContext, useContext, useState } from "react";

type Lead = {
  lead_id?: string;
  lead_name?: string;
  lead_ph_no?: string;
  lead_email?: string;
  lead_city?: string;
  lead_product?: string;
  lead_source?: string;
  [key: string]: any;
};

type Applicant = { [key: string]: any };
type Application = { [key: string]: any };

type FormFlowContextType = {
  lead: Lead;
  applicant: Applicant;
  application: Application;
  updateLead: (patch: Partial<Lead>) => void;
  updateApplicant: (patch: Partial<Applicant>) => void;
  updateApplication: (patch: Partial<Application>) => void;
  reset: () => void;
};

const FormFlowContext = createContext<FormFlowContextType | undefined>(undefined);

export function FormFlowProvider({ children }: { children: React.ReactNode }) {
  const [lead, setLead] = useState<Lead>({});
  const [applicant, setApplicant] = useState<Applicant>({});
  const [application, setApplication] = useState<Application>({});

  function updateLead(patch: Partial<Lead>) {
    setLead((s) => ({ ...s, ...patch }));
  }

  function updateApplicant(patch: Partial<Applicant>) {
    setApplicant((s) => ({ ...s, ...patch }));
  }

  function updateApplication(patch: Partial<Application>) {
    setApplication((s) => ({ ...s, ...patch }));
  }

  function reset() {
    setLead({});
    setApplicant({});
    setApplication({});
  }

  return (
    <FormFlowContext.Provider value={{ lead, applicant, application, updateLead, updateApplicant, updateApplication, reset }}>
      {children}
    </FormFlowContext.Provider>
  );
}

export function useFormFlow() {
  const ctx = useContext(FormFlowContext);
  if (!ctx) throw new Error("useFormFlow must be used within FormFlowProvider");
  return ctx;
}
