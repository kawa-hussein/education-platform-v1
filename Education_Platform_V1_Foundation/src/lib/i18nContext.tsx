import React,{createContext,useContext,useEffect,useMemo,useState} from "react";
import {localizeLabel,tr,type Lang} from "./i18n";
import {moduleTitle} from "../data/moduleLocale";

type I18nValue={lang:Lang;setLang:(lang:Lang)=>void;t:(key:string)=>string;label:(text:string)=>string;module:(code:string,fallback?:string)=>string;dir:"rtl"|"ltr"};
const Context=createContext<I18nValue|null>(null);
const supported=new Set<Lang>(["en","ku","ar","tr"]);

export function I18nProvider({children}:{children:React.ReactNode}){
  const stored=(localStorage.getItem("edu_lang")||"en") as Lang;
  const [lang,setLangState]=useState<Lang>(supported.has(stored)?stored:"en");
  const setLang=(next:Lang)=>setLangState(supported.has(next)?next:"en");
  useEffect(()=>{
    localStorage.setItem("edu_lang",lang);
    document.documentElement.lang=lang==="ku"?"ckb":lang;
    document.documentElement.dir=(lang==="ku"||lang==="ar")?"rtl":"ltr";
  },[lang]);
  const value=useMemo<I18nValue>(()=>({
    lang,setLang,t:(key)=>tr(lang,key),label:(text)=>localizeLabel(lang,text),module:(code,fallback)=>moduleTitle(code,lang,fallback),dir:(lang==="ku"||lang==="ar")?"rtl":"ltr"
  }),[lang]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useI18n(){
  const value=useContext(Context);
  if(!value)throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
