/* SM Prime Properties — cinematic Chitradurga real estate frontend */
const CFG = window.SM_PRIME_CONFIG || {};
const READY = Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
const db = READY ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;
const WHATSAPP = String(CFG.whatsappNumber || "").replace(/\D/g, "");
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let properties = [], activeProperty = null, currentUser = null;
const fallbackPhotos = [
 "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
 "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
 "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85"
];
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function price(v,purpose){let n=Number(v||0);if(purpose==="Rent")return "₹"+n.toLocaleString("en-IN")+"/month";if(n>=10000000)return "₹"+(n/10000000).toFixed(2).replace(/\.00$/,"")+" Cr";if(n>=100000)return "₹"+(n/100000).toFixed(2).replace(/\.?0+$/,"")+" lakh";return "₹"+n.toLocaleString("en-IN");}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add("hidden"),4200);}
function normalise(r){return {id:r.id,title:r.title,type:r.property_type,location:r.location,purpose:r.purpose,price:Number(r.price_inr),area:Number(r.area_sqft||0),beds:Number(r.bedrooms||0),baths:Number(r.bathrooms||0),image:r.image_url||"",description:r.description||"",status:r.status||"Available",published:r.is_published!==false,created_at:r.created_at};}
function formatArea(n){return Number(n||0).toLocaleString("en-IN")+" sq. ft.";}
function filtered(){
 let a=[...properties];const p=$("#purposeFilter").value,t=$("#typeFilter").value,l=$("#locationFilter").value.trim().toLowerCase(),b=Number($("#budgetFilter").value||0),s=$("#sortFilter").value;
 a=a.filter(x=>(!p||x.purpose===p)&&(!t||x.type===t)&&(!l||x.location.toLowerCase().includes(l))&&(!b||x.price<=b)&&x.status!=="Sold"&&x.status!=="Rented");
 if(s==="low")a.sort((x,y)=>x.price-y.price);else if(s==="high")a.sort((x,y)=>y.price-x.price);else a.sort((x,y)=>new Date(y.created_at||0)-new Date(x.created_at||0));return a;
}
function render(){
 const a=filtered();$("#resultsCount").textContent=`${a.length} ${a.length===1?"property":"properties"} ${READY?"available":"· live listings not configured"}`;$("#emptyState").classList.toggle("hidden",a.length>0);
 $("#propertyGrid").innerHTML=a.map((p,i)=>`<article class="property-card" tabindex="0" role="button" aria-label="View ${esc(p.title)}" data-id="${esc(p.id)}" style="animation-delay:${i*75}ms"><div class="property-photo-wrap"><img class="property-photo" loading="lazy" src="${esc(p.image||fallbackPhotos[i%fallbackPhotos.length])}" alt="${esc(p.title)}"><span class="property-badge">${esc(p.type)}</span><span class="property-purpose">${p.purpose==="Rent"?"FOR RENT":"FOR SALE"}</span></div><div class="property-info"><div class="property-location">${esc(p.location)} · CHITRADURGA</div><h3 class="property-title">${esc(p.title)}</h3><div class="property-meta">${p.area?`<span>▧ ${formatArea(p.area)}</span>`:""}${p.beds?`<span>${p.beds} bed</span>`:""}${p.baths?`<span>${p.baths} bath</span>`:""}<span>${esc(p.status)}</span></div><div class="property-bottom"><div class="property-price">${price(p.price,p.purpose)}<small>${p.purpose==="Rent"?"MONTHLY RENT":"ASKING PRICE"}</small></div><span class="property-arrow">↗</span></div></div></article>`).join("");
}
async function load(){
 if(!READY){properties=[];$("#resultsCount").textContent="Live property catalogue not configured yet";$("#emptyState").classList.remove("hidden");$("#propertyGrid").innerHTML="";$("#emptyState h3").textContent="Your next property starts here.";$("#emptyState p").textContent="No properties have been published yet. The owner can add verified layout sites, plots, houses, rentals and commercial spaces through the private dashboard once the backend is connected.";return;}
 const {data,error}=await db.from("properties").select("*").eq("is_published",true).order("created_at",{ascending:false});
 if(error){console.error(error);properties=[];toast("Unable to load properties. Please check the database setup.");}
 else properties=(data||[]).map(normalise);
 render();
}
function openModal(id){activeProperty=properties.find(p=>p.id===id);if(!activeProperty)return;const p=activeProperty;const img=p.image||fallbackPhotos[0];
 $("#modalContent").innerHTML=`<div class="detail-layout"><img class="detail-image" src="${esc(img)}" alt="${esc(p.title)}"><div class="detail-copy"><div class="section-kicker">${esc(p.type)} / ${esc(p.location)} / CHITRADURGA</div><h2 id="modalTitle">${esc(p.title)}</h2><div class="detail-price">${price(p.price,p.purpose)}</div><p class="detail-description">${esc(p.description)}</p><div class="detail-specs"><div class="detail-spec">PURPOSE<strong>${esc(p.purpose)}</strong></div><div class="detail-spec">AREA<strong>${p.area?formatArea(p.area):"Not specified"}</strong></div><div class="detail-spec">STATUS<strong>${esc(p.status)}</strong></div></div><p class="detail-description">Please independently verify ownership, approvals, dimensions, availability and documents before making any payment or commitment.</p><div class="detail-actions"><button class="button button-gold" id="propertyWhatsApp">Enquire on WhatsApp ↗</button><a class="button button-outline" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location+", Chitradurga, Karnataka, India")}" target="_blank" rel="noopener">Open map ↗</a></div></div></div>`;
 $("#propertyModal").classList.remove("hidden");document.body.classList.add("modal-open");
}
function closeModal(id){$(id).classList.add("hidden");document.body.classList.remove("modal-open");}
function wa(message){if(!WHATSAPP){toast("WhatsApp is not configured yet. Add your number in config.js.");return;}window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,"_blank","noopener");}
function adminState(){
 $("#adminWorkspace").classList.toggle("hidden",!currentUser);
 $("#adminSignOut").classList.toggle("hidden",!currentUser);
 $("#adminLoginForm").querySelectorAll("input,button").forEach(x=>x.disabled=Boolean(currentUser));
 $("#adminStatus").textContent=!READY?"Backend not connected. Follow DEPLOYMENT.md to set up Supabase; admin sign-in stays disabled until configured.":currentUser?`Signed in as ${currentUser.email}.`:"Private access. Sign in with the owner account you created in Supabase.";
}
async function refreshAdmin(){
 if(!READY||!currentUser)return;
 const {data,error}=await db.from("properties").select("*").order("created_at",{ascending:false});
 if(error){toast("Could not load admin listings. Check admin permissions.");return;}
 const all=(data||[]).map(normalise);
 $("#adminListingList").innerHTML=all.map(p=>`<div class="admin-row"><div><strong>${esc(p.title)}</strong><small>${esc(p.location)} · ${esc(p.type)} · ${price(p.price,p.purpose)} · ${p.published?"Published":"Draft"} · ${esc(p.status)}</small></div><div class="admin-row-actions"><button data-edit="${esc(p.id)}">Edit</button><button data-delete="${esc(p.id)}">Delete</button></div></div>`).join("")||"<p>No properties yet. Add your first verified listing above.</p>";
 const {data:leads,error:leadError}=await db.from("leads").select("id,name,phone,interest,area,message,created_at").order("created_at",{ascending:false}).limit(50);
 $("#adminLeadList").innerHTML=leadError?"<p>Could not load enquiries.</p>":(leads||[]).map(l=>`<div class="admin-row"><div><strong>${esc(l.name)} · ${esc(l.interest)}</strong><small>${esc(l.phone)} · ${esc(l.area||"Area not specified")}</small><small>${esc(l.message||"No extra requirements")} · ${new Date(l.created_at).toLocaleDateString()}</small></div><a href="https://wa.me/${encodeURIComponent(String(l.phone).replace(/\D/g,""))}" target="_blank" rel="noopener">Contact</a></div>`).join("")||"<p>No enquiries received yet.</p>";
}
function resetAdmin(){const f=$("#adminForm");f.reset();f.elements.id.value="";f.elements.area.value=0;f.elements.beds.value=0;f.elements.baths.value=0;f.elements.status.value="Available";f.elements.published.checked=true;$("#saveListingBtn").textContent="Publish property ↗";$("#listingFormTitle").textContent="Add a property";}
function fillEdit(p){const f=$("#adminForm");f.elements.id.value=p.id;f.elements.title.value=p.title;f.elements.type.value=p.type;f.elements.purpose.value=p.purpose;f.elements.location.value=p.location;f.elements.price.value=p.price;f.elements.area.value=p.area;f.elements.beds.value=p.beds;f.elements.baths.value=p.baths;f.elements.status.value=p.status;f.elements.image.value=p.image;f.elements.description.value=p.description;f.elements.published.checked=p.published;$("#saveListingBtn").textContent="Save changes ↗";$("#listingFormTitle").textContent="Edit property";f.scrollIntoView({behavior:"smooth",block:"start"});}
async function init(){
 $("#year").textContent=new Date().getFullYear();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target);}}),{threshold:.12});
 $$(".reveal").forEach(el=>observer.observe(el));
 if(READY){const {data}=await db.auth.getSession();currentUser=data.session?.user||null;db.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;adminState();if(currentUser&&!$("#adminModal").classList.contains("hidden"))refreshAdmin();});}
 adminState();await load();
}
$("#searchBtn").addEventListener("click",()=>{render();$("#propertyGrid").scrollIntoView({behavior:"smooth",block:"start"});});
["purposeFilter","typeFilter","locationFilter","budgetFilter","sortFilter"].forEach(id=>$("#"+id).addEventListener(id==="locationFilter"||id==="budgetFilter"?"input":"change",render));
$("#resetFilters").addEventListener("click",()=>{$("#purposeFilter").value=$("#typeFilter").value=$("#locationFilter").value=$("#budgetFilter").value="";$("#sortFilter").value="newest";render();});
$("#propertyGrid").addEventListener("click",e=>{const card=e.target.closest("[data-id]");if(card)openModal(card.dataset.id);});
$("#propertyGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-id]")){e.preventDefault();openModal(e.target.dataset.id);}});
$("#modalClose").addEventListener("click",()=>closeModal("#propertyModal"));$("#propertyModal").addEventListener("click",e=>{if(e.target.id==="propertyModal")closeModal("#propertyModal");});
$("#modalContent").addEventListener("click",e=>{if(e.target.id==="propertyWhatsApp"&&activeProperty){const p=activeProperty;wa(`Hello SM Prime Properties, I am interested in ${p.title} (${p.type}) in ${p.location}, Chitradurga. Please share the details and viewing availability.`);}});
$("#plotShortcut").addEventListener("click",()=>{ $("#typeFilter").value="Residential Plot";render();$("#properties").scrollIntoView({behavior:"smooth"});});
$$(".category-list button").forEach(b=>b.addEventListener("click",()=>{$("#typeFilter").value=b.dataset.category;render();$("#properties").scrollIntoView({behavior:"smooth"});}));
$("#menuToggle").addEventListener("click",()=>$("#navLinks").classList.toggle("open"));$("#navLinks a").forEach(a=>a.addEventListener("click",()=>$("#navLinks").classList.remove("open")));
$("#adminOpen").addEventListener("click",()=>{$("#adminModal").classList.remove("hidden");document.body.classList.add("modal-open");adminState();if(currentUser)refreshAdmin();});
$("#adminClose").addEventListener("click",()=>closeModal("#adminModal"));$("#adminModal").addEventListener("click",e=>{if(e.target.id==="adminModal")closeModal("#adminModal");});
$("#adminLoginForm").addEventListener("submit",async e=>{e.preventDefault();if(!READY){toast("Connect Supabase first using DEPLOYMENT.md.");return;}const f=new FormData(e.target);const {data,error}=await db.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error){toast("Sign-in failed. Check the owner credentials and admin allowlist.");return;}currentUser=data.user;adminState();await refreshAdmin();toast("Signed in successfully.");});
$("#adminSignOut").addEventListener("click",async()=>{if(db)await db.auth.signOut();currentUser=null;adminState();toast("Signed out.");});
$("#adminForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!READY||!currentUser){toast("Sign in with the authorised owner account first.");return;}
 const f=e.target,fd=new FormData(f),id=String(fd.get("id")||"");let imageUrl=String(fd.get("image")||"").trim();const file=fd.get("photo");
 if(file&&file.size){if(file.size>8*1024*1024){toast("Choose a photo smaller than 8 MB.");return;}const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";const path=`${currentUser.id}/${crypto.randomUUID()}.${ext}`;const upload=await db.storage.from("property-images").upload(path,file,{upsert:false,contentType:file.type||"image/jpeg"});if(upload.error){toast("Photo upload failed. Check storage setup and file type.");return;}imageUrl=db.storage.from("property-images").getPublicUrl(path).data.publicUrl;}
 const row={title:String(fd.get("title")).trim(),property_type:String(fd.get("type")),purpose:String(fd.get("purpose")),location:String(fd.get("location")).trim(),price_inr:Number(fd.get("price")),area_sqft:Number(fd.get("area")||0),bedrooms:Number(fd.get("beds")||0),bathrooms:Number(fd.get("baths")||0),status:String(fd.get("status")),image_url:imageUrl||null,description:String(fd.get("description")).trim(),is_published:fd.get("published")==="on"};
 const result=id?await db.from("properties").update(row).eq("id",id).select().single():await db.from("properties").insert({...row,created_by:currentUser.id}).select().single();
 if(result.error){console.error(result.error);toast("Could not save. Check the SQL schema and owner access.");return;}
 toast(id?"Property updated.":"Property added.");resetAdmin();await load();await refreshAdmin();
});
$("#cancelEditBtn").addEventListener("click",resetAdmin);
$("#adminListingList").addEventListener("click",async e=>{
 if(!READY||!currentUser)return;const del=e.target.closest("[data-delete]"),edit=e.target.closest("[data-edit]");
 if(del){if(!confirm("Delete this property permanently?"))return;const {error}=await db.from("properties").delete().eq("id",del.dataset.delete);if(error){toast("Delete failed. Check admin access.");return;}toast("Property deleted.");await load();await refreshAdmin();}
 if(edit){const {data,error}=await db.from("properties").select("*").eq("id",edit.dataset.edit).single();if(error){toast("Could not open this listing.");return;}fillEdit(normalise(data));}
});
$("#leadForm").addEventListener("submit",async e=>{
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());
 const msg=`Hello SM Prime Properties. Name: ${d.name}. Phone: ${d.phone}. Interest: ${d.interest}. Area: ${d.area||"Flexible"}. Requirements: ${d.message||"Please contact me."}`;
 if(READY){const {error}=await db.from("leads").insert({name:String(d.name).trim(),phone:String(d.phone).trim(),interest:String(d.interest),area:String(d.area||"").trim()||null,message:String(d.message||"").trim()||null});if(error){console.error(error);toast("Your enquiry could not be saved. Please try again.");return;}toast("Thank you — your enquiry has been received.");e.target.reset();if(WHATSAPP)wa(msg);}
 else {toast("Enquiries are not yet connected. Configure Supabase and WhatsApp before launch.");}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal("#propertyModal");closeModal("#adminModal");}});
init();
