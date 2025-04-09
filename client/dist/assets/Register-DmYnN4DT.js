import{r as x,u as D,j as e,L as V,a as h}from"./index-83Tp2EN1.js";import{a as w}from"./index-t--hEgTQ.js";import{f as _,a as $,F as R}from"./index-BWBgj6Hi.js";import{u as T}from"./auth-Be68LJyF.js";const C=(r=!1)=>{const[c,t]=x.useState(r),o=()=>t(!c);return{type:c?"text":"password",icon:c?_:$,toggle:o,handleKeyDown:u=>{(u.key==="Enter"||u.key===" ")&&o()},visible:c}};function U(){const[r,c]=x.useState({firstName:"",lastName:"",password:"",confirmPassword:"",phoneNumber:"",verificationCode:""}),[t,o]=x.useState({isCodeSent:!1,canResendCode:!0,isSubmitting:!1}),p=C(),u=C(),S=D(),{message:j,showMessage:E,error:b,showError:N,isVisible:k}=T(),F=s=>{const a=s.replace(/\D/g,"").slice(0,11);let i=a;return a.length>0&&(i="+7 (",a.length>1&&(i+=`${a.slice(1,4)}`),a.length>4&&(i+=`) ${a.slice(4,7)}`),a.length>7&&(i+=`-${a.slice(7,9)}`),a.length>9&&(i+=`-${a.slice(9)}`)),i},P=s=>{const n=s.target.value,a=r.phoneNumber;if(n.length<a.length){c(l=>({...l,phoneNumber:n}));return}const i=F(n);c(l=>({...l,phoneNumber:i}))},f=()=>{const s=r.phoneNumber.replace(/\D/g,"");return s.length===10?"7"+s:s},d=(s,n)=>{const{id:a,value:i}=s.target;a==="phoneNumber"?P(s):c(l=>({...l,[a]:i}))},g=async()=>{var s,n;o(a=>({...a,isSubmitting:!0}));try{const a=f();(await w.post("http://api.dom-ban-na-drovah.ru/api/register",{phone_number:a})).status===200&&(o({isCodeSent:!0,canResendCode:!1,isSubmitting:!1}),E("Код отправлен на Ваш номер телефона."),setTimeout(()=>o(l=>({...l,canResendCode:!0})),6e4))}catch(a){o(i=>({...i,isSubmitting:!1})),N(((n=(s=a.response)==null?void 0:s.data)==null?void 0:n.error)||"Ошибка отправки кода.")}},q=async()=>{var s,n;if(r.password!==r.confirmPassword){N("Пароли не совпадают!");return}o(a=>({...a,isSubmitting:!0}));try{const a=f(),i=await w.post("/api/verify-registration",{first_name:r.firstName,last_name:r.lastName,password:r.password,phone_number:a,verification_code:r.verificationCode});if(i.status===201){const{token:l,userId:v,first_name:I,last_name:L}=i.data;h.set("token",l,{expires:7,secure:!0}),h.set("userId",v,{expires:7,secure:!0}),h.set("firstName",I,{expires:7,secure:!0}),h.set("lastName",L,{expires:7,secure:!0}),S(`/userAccount/${v}`)}}catch(a){N(((n=(s=a.response)==null?void 0:s.data)==null?void 0:n.error)||"Ошибка регистрации. Пожалуйста, проверьте данные.")}finally{o(a=>({...a,isSubmitting:!1}))}},m=r.firstName&&r.lastName&&r.password&&r.confirmPassword&&f().length>=11,X=r.verificationCode.length===4,y=s=>e.jsx(R,{icon:s.icon,className:"passwordIcon",onClick:s.toggle,"aria-label":s.visible?"Скрыть пароль":"Показать пароль",tabIndex:"0",onKeyDown:s.handleKeyDown,role:"button","aria-pressed":s.visible});return e.jsx("div",{className:"auth-container",role:"region","aria-labelledby":"registerTitle",children:e.jsx("div",{className:"auth-block reg",role:"group","aria-labelledby":"registerBlockLabel",children:e.jsxs("div",{className:"auth-content",children:[e.jsx("h2",{id:"registerTitle",className:"auth-title",children:"РЕГИСТРАЦИЯ"}),(j||b)&&e.jsx("p",{className:`auth-message ${b?"error":"success"} ${k?"fade-in":"fade-out"}`,role:"alert",children:j||b}),e.jsx("div",{className:"auth-form",children:e.jsxs("div",{className:"auth-row",children:[e.jsxs("div",{className:"auth-column",children:[e.jsxs("label",{className:"auth-label",htmlFor:"firstName",children:["Имя",e.jsx("input",{type:"text",id:"firstName",className:"auth-input",placeholder:"Введите имя",maxLength:20,onChange:s=>d(s),value:r.firstName,required:!0,"aria-required":"true","aria-describedby":"firstNameError"}),e.jsx("span",{id:"firstNameError",className:"screen-reader-only"})]}),e.jsxs("label",{className:"auth-label",htmlFor:"lastName",children:["Фамилия",e.jsx("input",{type:"text",id:"lastName",className:"auth-input",placeholder:"Введите фамилию",maxLength:20,onChange:s=>d(s),value:r.lastName,required:!0,"aria-required":"true","aria-describedby":"lastNameError"}),e.jsx("span",{id:"lastNameError",className:"screen-reader-only"})]})]}),e.jsxs("div",{className:"auth-column",children:[e.jsxs("label",{className:"auth-label",htmlFor:"password",children:["Пароль",e.jsxs("div",{className:"passwordInput",children:[e.jsx("input",{type:p.type,id:"password",className:"auth-input",placeholder:"Введите пароль",maxLength:16,onChange:s=>d(s),value:r.password,required:!0,"aria-required":"true","aria-describedby":"passwordError"}),y(p)]}),e.jsx("span",{id:"passwordError",className:"screen-reader-only"})]}),e.jsxs("label",{className:"auth-label",htmlFor:"confirmPassword",children:["Проверка пароля",e.jsxs("div",{className:"passwordInput",children:[e.jsx("input",{type:u.type,id:"confirmPassword",className:"auth-input",placeholder:"Повторите пароль",maxLength:16,onChange:s=>d(s),value:r.confirmPassword,required:!0,"aria-required":"true","aria-describedby":"confirmPasswordError"}),y(u)]}),e.jsx("span",{id:"confirmPasswordError",className:"screen-reader-only"})]})]}),e.jsxs("div",{className:"auth-column",children:[e.jsxs("label",{className:"auth-label",htmlFor:"phoneNumber",children:["Номер телефона",e.jsx("input",{type:"tel",id:"phoneNumber",className:"auth-input",placeholder:"+7 (XXX) XXX-XX-XX",maxLength:18,onChange:s=>d(s),value:r.phoneNumber,required:!0,"aria-required":"true","aria-describedby":"phoneNumberError"}),e.jsx("span",{id:"phoneNumberError",className:"screen-reader-only"})]}),m&&e.jsxs("label",{className:"auth-label",htmlFor:"verificationCode",children:["Код верификации",e.jsx("input",{type:"text",id:"verificationCode",className:"auth-input",placeholder:"Введите код",maxLength:4,onChange:s=>d(s),value:r.verificationCode,required:!0,"aria-required":"true","aria-describedby":"verificationCodeError"}),e.jsx("span",{id:"verificationCodeError",className:"screen-reader-only"})]})]})]})}),!t.isCodeSent&&!m&&e.jsx("button",{className:"auth-button",onClick:g,disabled:!m||t.isSubmitting,"aria-busy":t.isSubmitting,"aria-live":"polite",children:"Зарегистрироваться"}),m&&!t.isCodeSent&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"auth-info",children:"На Ваш номер телефона поступит звонок, введите последние 4 цифры номера."}),e.jsx("button",{className:"auth-button",onClick:g,disabled:!m||t.isSubmitting,"aria-busy":t.isSubmitting,"aria-live":"polite",children:t.isSubmitting?"Отправка...":"Отправить код"})]}),t.isCodeSent&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"auth-button",onClick:q,disabled:!X||t.isSubmitting,"aria-busy":t.isSubmitting,"aria-live":"polite",children:t.isSubmitting?"Регистрация...":"Зарегистрироваться"}),t.canResendCode&&e.jsx("button",{className:"auth-button",onClick:g,disabled:t.isSubmitting,"aria-busy":t.isSubmitting,"aria-live":"polite",children:"Отправить код еще раз"})]}),e.jsx("div",{className:"auth-links",children:e.jsxs("p",{children:["Уже есть учетная запись?",e.jsxs(V,{to:"/domashnya-banya-na-drovah/login",className:"auth-link",children:[" ","Войдите"]})]})})]})})})}export{U as default};
