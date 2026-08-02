export const formatDate=(v:string)=>new Intl.DateTimeFormat('es-PE').format(new Date(v+'T00:00:00'));export const fullName=(p:{nombres:string;apellidos:string})=>`${p.nombres} ${p.apellidos}`.trim();
