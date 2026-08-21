import React, { useState, useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';

const TermsConditionsPage = () => {
  const [activeTab, setActiveTab] = useState('value-drive');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta
        title="Terms of Use & Conditions | Selectt"
        description="Review the terms and conditions for using the Selectt platform, services, inspection reports, and vehicle data."
      />

      <div className="min-h-screen bg-[#f9f9f9] text-[#0C1B33] font-sans pb-20 w-full overflow-x-hidden pt-0">
        
        {/* ── Dark Hero Banner Section ── */}
        <section className="relative pt-24 pb-16 w-full flex items-center justify-center overflow-hidden border-b border-slate-800/80 bg-[#0C1B33]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <span className="text-[#00C9AF] text-xs md:text-sm font-black uppercase tracking-[0.25em] mb-3 block">
              PLATFORM AGREEMENT
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
              Terms Of Use
            </h1>
          </div>
        </section>

        {/* ── Main Container ── */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
          
          {/* ── Tabs Bar ── */}
          <div className="border-b border-slate-200 mb-8 flex gap-6 md:gap-8 justify-start">
            {[
              { id: 'value-drive', label: 'Value Drive' },
              { id: 'pure-ride', label: 'Pure Ride' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm md:text-base font-extrabold uppercase tracking-wider transition-all relative outline-none cursor-pointer ${
                    isActive ? 'text-[#0C1B33]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00C9AF] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Terms Content ── */}
          <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-sm border border-slate-200/80 max-w-none text-slate-600 leading-relaxed text-sm md:text-base">
            
            {activeTab === 'value-drive' ? (
              // ── VALUE DRIVE TERMS ──
              <div className="space-y-6">
                <p>
                  These Terms of Use govern the use of the <span className="font-bold text-[#0C1B33]">www.selectt.in</span> website, not including in relation to the 'Sell car' functionality of the website ("Website"), which is governed by the terms and conditions available on the platform. The Website is owned and operated by Selectt Technologies Private Limited, a company incorporated under the Companies Act, 2013 with its registered office at 8th Floor, Tower A, Capital Business Park, Sector - 48, Gurugram - 122018 (hereinafter referred to as "Selectt" or "We" or "Us" or "Our"). For the purpose of these Terms of Use, the Terms of Use, wherever the context so requires, ("You" or "Your" or "Yourself" or "Buyer") shall mean a natural or legal person interested in purchasing motor vehicles that are listed on the Website and availing such other services made available by Selectt (collectively referred to as the "Platform").
                </p>

                <p className="font-bold text-[#0C1B33] text-xs md:text-sm uppercase tracking-wider border-l-4 border-[#00C9AF] pl-4 py-1 bg-slate-50">
                  THESE TERMS OF USE ARE SUBJECT TO REVISION BY US AT ANY TIME. PLEASE READ THESE TERMS AND CONDITIONS OF USE CAREFULLY BEFORE USING OR REGISTERING, BROWSING OR ACCESSING OR OTHERWISE USING THE PLATFORM. THE REVISED TERMS OF USE SHALL BE MADE AVAILABLE ON THE PLATFORM. YOU ARE REQUESTED TO VIEW THE MOST CURRENT TERMS OF USE. IT SHALL BE YOUR RESPONSIBILITY TO CHECK THESE TERMS OF USE PERIODICALLY FOR CHANGES. WE MAY REQUIRE YOU TO PROVIDE YOUR DIRECT OR INDIRECT CONSENT TO ANY UPDATE IN A SPECIFIED MANNER BEFORE FURTHER USE OF THE PLATFORM. IF NO SUCH SEPARATE CONSENT IS SOUGHT, YOUR CONTINUED USE OF THE PLATFORM SHALL SIGNIFY YOUR ACCEPTANCE OF THE TERMS OF USE AND YOUR AGREEMENT TO BE LEGALLY BOUND BY THE SAME.
                </p>

                <p>
                  REFERENCE TO MOTOR VEHICLES SHALL MEAN THE REFERENCE TO PRE-OWNED CARS ONLY UNLESS THE PLATFORM OFFERS SERVICES EXTENDED TO OTHER FORMS OF AUTOMOBILES IN WHICH CASE THE TERM AUTOMOBILES SHALL INCLUDE SUCH OTHER FORMS.
                </p>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-center font-black text-[#0C1B33] text-base md:text-lg uppercase tracking-widest mb-6 underline">
                    PART A – GENERAL TERMS RELATING TO PLATFORM
                  </h3>

                  <div className="space-y-6">
                    {/* Eligibility to Use */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">1. Eligibility to Use :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Use of the Platform is not available to minors under the age of eighteen (18) years and excludes persons who are incompetent to contract within the meaning of the Indian Contract Act, 1872, including minors, undischarged insolvents or to any Users suspended or removed from the Platform by Selectt for any reason whatsoever. If You are disqualified as per the preceding sentence, You shall not be permitted to avail of the Services or use the Website. You represent that You are of legal age to form a binding contract and are not a person barred from receiving the Services under the laws as applicable in India.</li>
                        <li>Selectt reserves the right to refuse access to use the Services offered at the Website to new Users or to terminate access granted to existing Users at any time without according any reasons for doing so.</li>
                        <li>You shall not have more than one active Account (defined hereunder) on the Platform. Additionally, You are prohibited from selling, trading, or otherwise transferring Your Account to another person.</li>
                      </ol>
                    </div>

                    {/* Registration of Your Account */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">2. Registration of Your Account :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You may access and use the Platform either as a registered User or as a guest user. However, not all sections of the www.selectt.in website will be accessible to all guest users.</li>
                        <li>You can create a registered user account by providing Selectt certain User information as requested by Us, following which You can create a specific log-in ID and password ("Account").</li>
                        <li>If You use the Platform, You are responsible for maintaining the confidentiality of Your Account and password and for restricting access to Your computer to prevent unauthorised access to Your account. You agree to accept responsibility for all activities that occur under Your account or password. You should take all necessary steps to ensure that the password is kept confidential and secure and should inform us immediately if You have any reason to believe that Your password has become known to anyone else, or if the password is being, or is likely to be, used in an unauthorised manner.</li>
                        <li>Please ensure that the details you provide Us with are correct and complete and inform Us immediately of any changes to the information that you provided when registering. You can access and update much of the information you provided Us with in the Your Account area of the Platform. You agree and acknowledge that you will use your account on the Platform to make purchases only for your personal use and not for business purposes. Should you wish to order products for business purposes, please reach out to <span className="font-bold text-[#0C1B33]">contact@selectt.in</span>. Selectt reserves the right to refuse access to the Platform, terminate accounts, remove or edit content at any time without notice to You.</li>
                        <li>You may be required to provide certain personal information and We may collect certain personal information. Your provision of, and Selectt's collection, storage, use, disclosure and otherwise dealing of such personal information shall be governed by Selectt's privacy policy, which is available on the platform.</li>
                      </ol>
                    </div>

                    {/* User Representations and Obligations */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">3. User Representations and Obligations :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Subject to compliance with the Terms of Use, Selectt grants You a non-exclusive, limited privilege to access and use this Platform and the Platform Services.</li>
                        <li>You agree to use the Platform Services, Platform and the materials provided therein only: (a) for purposes that are permitted by the Terms of Use; and (b) in accordance with any applicable law, regulation or generally accepted practices or guidelines.</li>
                        <li>You shall solely be responsible for Your employees, subcontractors and representatives and all claims made in relation to or by Your employees, subcontractors and representatives, and Selectt shall not be responsible for them in any manner whatsoever.</li>
                        <li>You agree to not engage in activities that may adversely affect the use of the Platform by other Customers/ Selectt/registered trading partners.</li>
                        <li>You agree not to access (or attempt to access) the Platform and the materials or Platform Services by any means other than through the interface that is provided by Selectt. You shall not use any deep-link, robot, spider or other automatic device, program, algorithm or methodology, or any similar or equivalent manual process, to access, acquire, copy or monitor any portion of the Platform or Content, or in any way reproduce or circumvent the navigational structure or presentation of the Platform, materials or any Content, to obtain or attempt to obtain any materials, documents or information through any means not specifically made available through the Platform.</li>
                        <li>You acknowledge and agree that by accessing or using the Platform or Platform Services, You may be exposed to content from others (including but not limited to, Other Customers, registered trading partners, and other users/visitors) that You may consider offensive, indecent or otherwise objectionable. Selectt disclaims all liabilities arising in relation to such offensive content on the Platform.</li>
                        <li>If the Platform allows You to post and upload any material on the Platform, You hereby undertake to ensure that such material is not offensive and is in accordance with applicable laws. All material added, created, uploaded, submitted, distributed, or posted to the Platform by You is Your sole responsibility.</li>
                        <li>You hereby do and shall grant Selectt a worldwide, non-exclusive, perpetual, royalty-free, sub-licensable and transferable license to use, reproduce, disclose, distribute, template and otherwise fully exploit any such material, in connection with the Platform and Selectt's (and Selectt's successors' and assigns') businesses, including without limitation, for promoting the Platform in any media formats and through any media channels. You represent and warrant that You have all rights to grant such licenses to Selectt without infringement or violation of any third party rights, including without limitation, copyright, privacy rights, publicity rights, trademarks, contract rights, or any other intellectual property or proprietary rights.</li>
                        <li>
                          <span className="font-bold text-[#0C1B33]">Further, You undertake not to:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>Defame, abuse, harass, threaten or otherwise violate the legal rights of others;</li>
                            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent Your affiliation with a person or entity;</li>
                            <li>Publish, post, upload, distribute or disseminate any information that is harmful, harassing, blasphemous, defamatory, obscene, pornographic, pedophilic, libellous, hateful, or racially, ethnically objectionable, disparaging, inappropriate, profane, infringing or otherwise unlawful in any manner whatever; or that threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign states, or public order or causes incitement to the commission of any cognisable offence or prevents investigation of any offence or is insulting any other nation;</li>
                            <li>Upload files that contain software or other material protected by applicable intellectual property laws unless You own or control the rights thereto or have received all necessary consents;</li>
                            <li>Upload or distribute files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of the Platform or another's computer;</li>
                            <li>Engage in any activity that interferes with or disrupts access to the Platform or the Platform Services (or the servers and networks which are connected to the Platform);</li>
                            <li>Attempt to gain unauthorized access to any portion or feature of the Platform, any other systems or networks connected to the Platform, to any Selectt server, or to any of the Platform Services offered on or through the Platform, by hacking, password mining or any other illegitimate means;</li>
                            <li>Probe, scan or test the vulnerability of the Platform or any network connected to the Platform, nor breach the security or authentication measures on the Platform or any network connected to the Platform. You may not reverse look-up, trace or seek to trace any information on any other user, registered trading partner, other Customer, or visitor to, the Platform, to its source, or exploit the Platform or Platform Services or information made available or offered by or through the Platform, in any way whether or not the purpose is to reveal any information, including but not limited to personal identification information, other than Your own information, as provided for by the Platform;</li>
                            <li>Disrupt or interfere with the security of, or otherwise cause harm to, the Platform, systems resources, accounts, passwords, servers or networks connected to or accessible through the Platform or any affiliated or linked sites;</li>
                            <li>Collect or store data about other Customers/users in connection with the prohibited conduct and activities set forth in this Section;</li>
                            <li>Use any device or software to interfere or attempt to interfere with the proper working of the Platform or any transaction being conducted on the Platform, or with any other person's use of the Platform;</li>
                            <li>Use the Platform or any material or Content for any purpose that is unlawful or prohibited by these Terms of Use, or to solicit the performance of any illegal activity or other activity which infringes the rights of Selectt or other third parties;</li>
                            <li>Falsify or delete any author attributions, legal or other proper notices or proprietary designations or labels of the origin or source of software or other material contained in a file that is uploaded;</li>
                            <li>Violate any code of conduct or other guidelines, which may be applicable for or to any particular Platform Service;</li>
                            <li>Violate any applicable laws or regulations for the time being in force within or outside India;</li>
                            <li>Violate the Terms of Use contained herein or elsewhere; and</li>
                            <li>Reverse engineer, modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information or software obtained from the Platform.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    {/* Use of Materials */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">4. Use of Materials :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>
                          <span className="font-bold text-[#0C1B33]">Except as expressly indicated herein, Selectt hereby grants You a non-exclusive, freely revocable (upon notice from Selectt), non-transferable access to view, download and print any materials available on the Platform, subject to the following conditions:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>You may access and use the materials solely for personal, informational, and internal purposes, in accordance with the Terms of Use;</li>
                            <li>You may not modify or alter the materials available on the Platform;</li>
                            <li>You may not distribute or sell, rent, lease, license or otherwise make the materials on the Platform available to others; and</li>
                            <li>You may not remove any text, copyright or other proprietary notices contained in Automobile Service related catalogues or any other materials available on the Platform.</li>
                          </ul>
                        </li>
                        <li>The rights granted to You in the materials as specified above are not applicable to the design, layout or look and feel of the Platform. Such elements of the Platform are protected by intellectual property rights and may not be copied or imitated in whole or in part.</li>
                        <li>Any software that is available on the Platform is the property of Selectt. You may not use, download or install any software available on the Platform, unless otherwise expressly permitted by these Terms of Use or by the express written permission of Selectt.</li>
                      </ol>
                    </div>

                    {/* Usage Conduct */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">5. Usage Conduct :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You shall solely be responsible for maintaining the necessary computer equipment and internet connections that may be required to access, use and transact on the Platform.</li>
                      </ol>
                    </div>

                    {/* Intellectual Property Rights */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">6. Intellectual Property Rights :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Subject to Section 7 below, the Platform and the processes, and their selection and arrangement, including but not limited to, all text, graphics, user interfaces, visual interfaces, sounds and music (if any), artwork and computer code (collectively, the "Content") on the Platform is owned and controlled by Selectt and the design, structure, selection, coordination, expression, look and feel and arrangement of such Content is protected by copyright, patent and trademark laws, and various other intellectual property rights.</li>
                        <li>The Selectt, "SELECTT" assured, Selectt Logo, and other marks, logos and service marks indicated on the Platform are trademarks or registered trademarks of Selectt or other respective third parties, as the case may be. You are not permitted to use the Marks without the prior consent of Selectt, or the third party that may own the Marks.</li>
                        <li>Except as expressly provided herein, You acknowledge and agree that You shall not copy, republish, post, display, translate, transmit, reproduce or distribute any Content through any medium without obtaining the necessary authorization from Selectt.</li>
                        <li>Selectt and its Affiliates respect the intellectual property of others. If you believe that your intellectual property rights have been used in a way that gives rise to concerns of infringement, please write to us at <span className="font-bold text-[#0C1B33]">trademark@selectt.in</span>.</li>
                      </ol>
                    </div>

                    {/* Disclaimer of Warranties & Liability */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">7. Disclaimer of Warranties & Liability :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm uppercase text-[#0C1B33] font-bold">
                        <li>YOU EXPRESSLY UNDERSTAND AND AGREE THAT, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW: THE PLATFORM, PLATFORM SERVICES, OTHER SERVICES AND OTHER MATERIALS ARE PROVIDED BY SELECTT ON AN "AS IS" BASIS WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, INCLUDING THE IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. WITHOUT LIMITING THE FOREGOING, SELECTT MAKES NO WARRANTY THAT (I) THE PLATFORM OR THE PLATFORM SERVICES OR OTHER SERVICES WILL MEET YOUR REQUIREMENTS OR YOUR USE OF THE PLATFORM OR THE PLATFORM SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE; (II) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE PLATFORM OR PLATFORM SERVICES WILL BE EFFECTIVE, ACCURATE OR RELIABLE; (III) THE QUALITY OF THE PLATFORM OR PLATFORM SERVICES WILL MEET YOUR EXPECTATIONS; OR (IV) ANY ERRORS OR DEFECTS IN THE PLATFORM OR PLATFORM SERVICES WILL BE CORRECTED. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM SELECTT OR THROUGH USE OF THE PLATFORM SERVICES SHALL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THE TERMS OF USE.</li>
                        <li>SELECTT WILL HAVE NO LIABILITY RELATED TO ANY REGISTERED TRADING PARTNER/ BUYER CONTENT ARISING UNDER INTELLECTUAL PROPERTY RIGHTS, LIBEL, PRIVACY, PUBLICITY, OBSCENITY OR OTHER LAWS. SELECTT ALSO DISCLAIMS ALL LIABILITY WITH RESPECT TO THE MISUSE, LOSS, MODIFICATION OR UNAVAILABILITY OF ANY TRADING PARTNER/CUSTOMER CONTENT.</li>
                        <li>SELECTT WILL NOT BE LIABLE FOR ANY LOSS THAT YOU MAY INCUR AS A CONSEQUENCE OF UNAUTHORIZED USE OF YOUR ACCOUNT OR ACCOUNT INFORMATION IN CONNECTION WITH THE PLATFORM OR ANY PLATFORM SERVICES, EITHER WITH OR WITHOUT YOUR KNOWLEDGE.</li>
                        <li>SELECTT HAS ENDEAVOURED TO ENSURE THAT ALL THE INFORMATION ON THE PLATFORM IS CORRECT, BUT SELECTT NEITHER WARRANTS NOR MAKES ANY REPRESENTATIONS REGARDING THE QUALITY, ACCURACY OR COMPLETENESS OF ANY DATA, INFORMATION, OR PLATFORM SERVICE. SELECTT SHALL NOT BE RESPONSIBLE FOR THE DELAY OR INABILITY TO USE THE PLATFORM OR RELATED FUNCTIONALITIES, THE PROVISION OF OR FAILURE TO PROVIDE FUNCTIONALITIES, OR FOR ANY INFORMATION, SOFTWARE, FUNCTIONALITIES AND RELATED GRAPHICS OBTAINED THROUGH THE PLATFORM, OR OTHERWISE ARISING OUT OF THE USE OF THE PLATFORM, WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY OR OTHERWISE. FURTHER, SELECTT SHALL NOT BE HELD RESPONSIBLE FOR NON-AVAILABILITY OF THE PLATFORM DURING PERIODIC MAINTENANCE OPERATIONS OR ANY UNPLANNED SUSPENSION OF ACCESS TO THE PLATFORM THAT MAY OCCUR DUE TO TECHNICAL REASONS OR FOR ANY REASON BEYOND OUR CONTROL. THE TRADING PARTNER UNDERSTANDS AND AGREES THAT ANY MATERIAL OR DATA DOWNLOADED OR OTHERWISE OBTAINED THROUGH THE PLATFORM IS DONE ENTIRELY AT BUYER'S OWN DISCRETION AND RISK, AND THAT YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEMS OR LOSS OF DATA THAT RESULTS FROM THE DOWNLOAD OF SUCH MATERIAL OR DATA.</li>
                        <li>Selectt operates exclusively the 'Sell car' functionality of the Website, and the 'Buy car' functionality is operated or managed by Selectt. Selectt disclaims all liability, whether direct or indirect, arising from or in connection with any purchases, disputes, defaults, losses, claims, or damages resulting from the use of the buy car functionality. Users engaging in purchase transactions do so entirely at their own risk and are advised to review and accept PureRide's terms, conditions, and policies before proceeding with any transaction.</li>
                      </ol>
                    </div>

                    {/* Indemnification and Limitation of Liability */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">8. Indemnification and Limitation of Liability :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You agree to indemnify, defend and hold harmless Selectt and its affiliates including but not limited to its (and its affiliates') officers, directors, consultants, agents and employees ("Indemnitees") from and against any and all losses, liabilities, claims, damages, demands, costs and expenses (including legal fees and disbursements in connection therewith and interest chargeable thereon) asserted against or incurred by the Indemnitees that arise out of, result from, or may be payable by virtue of, any breach or non-performance of any representation, warranty, covenant or agreement made or obligation to be performed by You pursuant to these Terms of Use. Further, You agree to hold the Indemnitees harmless against any claims made by any third party due to, or arising out of, or in connection with, Your use of the Platform or Platform Services, Your violation of the Terms of Use, or Your violation of any rights, including any intellectual property rights.</li>
                        <li>In no event shall Selectt, its officers, directors, consultants, agents and employees, be liable to You or any third party for any special, incidental, indirect, consequential or punitive damages whatsoever, including those resulting from loss of use, data or profits, whether or not foreseeable or whether or not Selectt has been advised of the possibility of such damages, arising out of or in connection with (i) Your use of or access to the Platform, Platform Services or materials on the Platform; or (ii) seller support services provided by registered trading partners.</li>
                        <li>The limitations and exclusions in this Section apply to the maximum extent permitted by applicable laws.</li>
                      </ol>
                    </div>

                    {/* Violation of the Terms of Use */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">9. Violation of the Terms of Use :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You agree that Selectt may, in its sole discretion and without prior notice, terminate Your access to the Platform and block Your future access to the Platform if Selectt determines that You have violated these Terms of Use or any other agreements. You also agree that any violation by You of these Terms of Use will constitute an unlawful and unfair business practice, and will cause irreparable harm to Selectt, for which monetary damages would be inadequate, and You consent to Selectt obtaining any injunctive or equitable relief that Selectt deems necessary or appropriate in such circumstances. These remedies are in addition to any other remedies that Selectt may have at law or in equity.</li>
                        <li>If Selectt does take any legal action against You as a result of Your violation of these Terms of Use, Selectt will be entitled to recover from You, and You agree to pay, all reasonable attorneys' fees and costs of such action, in addition to any other relief granted to Selectt.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-center font-black text-[#0C1B33] text-base md:text-lg uppercase tracking-widest mb-6 underline">
                    PART B – GENERAL TERMS FOR PLATFORM SERVICES
                  </h3>

                  <div className="space-y-6">
                    {/* Platform to support transactions & service */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">10. Platform to support transactions & service :</h4>
                      <p className="mb-2 font-semibold text-[#0C1B33]">
                        I. The Platform is an electronic platform in the form of an electronic marketplace that (a) provides a platform for trading partners to advertise, exhibit, make available and offer to sell motor vehicles to the Buyers; and (b) a platform for Buyers to accept the offer to sell of the motor vehicles listed by the trading partners on the Platform and to make payments to the trading partners for purchase of the motor vehicles and (c) services to facilitate the engagement of Buyers and sellers under commerce on the Platform; and (d) such other services as are incidental and ancillary thereto ("Platform Services"). Selectt may offer certain services in addition to the Platform Services:
                      </p>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Selectt may, at its discretion, add, modify or remove any of the Platform Services listed above from time to time without notice along with the terms and price of such services, which shall be deemed to be included in these Terms of Use. In case You choose to avail any such additional services You hereby agree to sign such additional contracts for regulating the additional services, as may be prescribed by Selectt. You shall be notified by Valuedrive of any changes to the Platform Services and Your access to the Platform Services will accordingly stand modified, specifically in the case where Selectt has offered new Platform Services and You have chosen to avail the same. The terms of new Platform Services shall be stated in Terms of Use which will be duly amended from time to time to incorporate the same.</li>
                        <li>The Platform is only a facilitator in relation to the transactions entered between You and the registered trading partner. The agreement for sale of motor vehicles and/or for provision of any support services provided to You by a registered trading partner, shall be between You and the registered trading partner and shall strictly be a bipartite contract between You and the registered trading partner and Selectt shall not be a party to the same.</li>
                        <li>Selectt has not independently verified and does not guarantee the truthfulness of the credentials of the registered trading partner and any description of their business, authorizations, offerings made by them including the nature of services, pricing, location, contact details, etc. provided by the registered trading partner. Such information has been collected from the concerned trading partner, who has guaranteed the truthfulness and completeness of the same and Selectt shall not in any manner, be responsible or liable for such information.</li>
                        <li>As instructed by the registered trading partner, Selectt merely displays the list price of the motor vehicles listed on the Platform. On similar lines, the Platform merely displays the approximate cost of the support services, provided by the trading partners. You acknowledge and agree that (i) the approximate cost of services provided by registered trading partner for each category is only indicative and not an actual estimate of the service costs; (ii) the actual fees charged by each registered trading partner may vary from the fees quoted by other registered trading partners; (iii) the actual fees may vary from the approximate service cost provided for a category on a case-to-case basis considering, the type and extent of services required, etc. This approximation of cost is arrived at by considering various objective factors including, but not limited to, the labour costs and the cost of parts that may be required to be replaced or fixed.</li>
                        <li>The total price indicated on the Platform for any seller support service is inclusive of the items described for that service (excluding taxes and other applicable charges under law) and may not include additional services found to be required at the time of availing such seller support service. In such a case, the registered trading partner / basis instructions registered trading partner will discuss any change in scope and fees that will be communicated to You.</li>
                        <li>Any seller support service once booked using the Platform and accepted by the registered trading partner, as the case maybe, cannot be cancelled or modified by You. For seller support services, that You have booked through the Platform, and have been cancelled by the registered trading partner, Selectt shall refund all amounts collected on behalf of registered trading partner from You in this regard, within 5 - 7 working days of such cancellation.</li>
                        <li>It shall be the sole responsibility of the registered trading partner to honor Your seller support services provided by them. Selectt shall not be responsible, and shall have no liability for the genuineness, the quality or completeness of such seller support services, including any delay in the provision thereof or cancellation of any service booking made with a registered trading partner through the Platform, or any offers, discounts or service packages communicated by the registered trading partner, or for any misconduct or fraud committed by a registered trading partner through the Platform, or any representatives etc. Selectt cannot be called upon to provide any guarantee/security with respect to the provision of seller support services by the registered trading partner.</li>
                        <li>You may conduct searches on the Platform to look for motor vehicles. The results for searches are derived on the basis of an algorithm which considers various factors, Customer reviews and feedback, pricing, etc. Alternatively, the registered trading partner may be listed on the basis of Customer-selected search criteria. In either case, Selectt does not have any control over the results of searches carried out by You on the Platform. The result of any search for registered trading partner conducted by You on the Platform shall not be construed as the opinion or preference of Selectt.</li>
                        <li>The Platform may categorize the registered trading partner on the basis of various factors, including Your feedback, quality of motor vehicles sold, reliability of the registered trading partner. You agree to accept such categorization and You acknowledge that Your searches on the Platform will be subject to such categorization.</li>
                        <li>Any booking made by You for an motor vehicle or Platform Services through the Platform may be subject to the additional terms and conditions mentioned therein, which You are presumed to have read and accepted at the time of making the service booking.</li>
                        <li>Selectt does not provide You with any guarantee that You will be able to purchase an motor vehicle listed on the Platform or avail any Platform Services.</li>
                      </ol>
                    </div>

                    {/* Termination */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">11. Termination :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The Terms of Use will continue to apply until terminated by either You or Selectt as set forth below. If You want to terminate Your agreement with Selectt, You may do so by (i) notifying Selectt to close Your Account on the Platform; and (ii) not accessing the Platform. Such termination shall take effect 30 (thirty) days after receipt of such notice by Selectt. You are obliged to process all service bookings received by You through the Platform prior to the date of closure of Your Account on the Platform.</li>
                        <li>
                          <span className="font-bold text-[#0C1B33]">Selectt may, at any time, with or without notice, terminate the Terms of Use with You if :</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>You breach any of the provisions of the Terms of Use, the Privacy Policy or any other terms, conditions, or policies that may be applicable to You from time to time (or have acted in a manner that clearly shows that You do not intend to, or are unable to, comply with the same);</li>
                            <li>Selectt is required to do so by law (for example, where the provision of the Platform Services to You is, or becomes, unlawful or upon receiving request for termination by law enforcement or other government agencies);</li>
                            <li>The provision of the Platform Services to You by Selectt is, in the opinion of Selectt, no longer commercially viable or in any way detrimental to Selectt, its business or the Platform; or</li>
                            <li>You provide any information that is untrue, inaccurate, not current or incomplete (or becomes untrue, inaccurate, not current or incomplete), or Selectt has reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete;</li>
                            <li>Selectt has elected to discontinue, with or without reason, access to the Platform, Platform Services or any part thereof.</li>
                          </ul>
                        </li>
                        <li>
                          <span className="font-bold text-[#0C1B33]">Selectt may also terminate or suspend all or a portion of Your Account or access to the Platform Services with or without reason. Termination of Your Account may include: (i) removal of access to all offerings within the Platform or with respect to the Platform Services; (ii) deletion of Your records and Account information, including Your personal information, log-in ID and password, and all related information, files and materials associated with or inside Your Account (or any part thereof); and (iii) barring of further use of the Platform and Platform Services. :</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>The termination of Your Account shall not relieve You of any liability that You may have incurred or may incur in relation to use of Platform Services prior to such termination;</li>
                            <li>You agree that all terminations shall be made in Selectt's sole discretion and that Selectt shall not be liable to You or any third party for any termination of Your Account, or Your access to the Platform and Platform Services.</li>
                            <li>If You or Selectt terminate Your use of the Platform, Selectt may delete any content or other materials relating to Your use of the Platform or the Platform Services and Selectt will have no liability to You or any third party for doing so.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    {/* Governing Law */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">12. Governing Law :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>These Terms of Use and all transactions entered into on or through the Platform and the relationship between You and Selectt shall be governed in accordance with the laws of India without reference to conflict of laws principles.</li>
                        <li>You agree that all claims, differences and disputes arising under or in connection with or in relation to the Platform, the Terms of Use or any transactions entered into on or through the Platform or the relationship between You and Selectt shall be subject to the exclusive jurisdiction of the Courts at Delhi, India and You hereby accede to and accept the jurisdiction of such Courts.</li>
                      </ol>
                    </div>

                    {/* Report Abuse */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">13. Report Abuse :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>In the event You come across any abuse or violation of these Terms of Use or if You become aware of any objectionable content on the Platform, please report the same to the following e-mail id: <span className="font-bold text-[#0C1B33]">contact@selectt.in</span>.</li>
                      </ol>
                    </div>

                    {/* Communications */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">14. Communications :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You hereby expressly agree to receive communications by way of SMS and/or e-mails from Selectt relating to the Platform Services provided through the Platform.</li>
                        <li>You can unsubscribe/ opt-out from receiving communications from Selectt through SMS and e-mail anytime at <span className="font-bold text-[#0C1B33]">support@selectt.in</span>.</li>
                      </ol>
                    </div>

                    {/* General Provisions */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">15. General Provisions :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Notice: All notices from Selectt will be served by email to Your registered email address or by general notification on the Platform. Any notice provided to Selectt pursuant to the Terms of Use should be sent to <span className="font-bold text-[#0C1B33]">contact@selectt.in</span> with subject line - Attention: TERMS OF USE.</li>
                        <li>Assignment: You cannot assign or otherwise transfer the Terms of Use, or any rights granted hereunder to any third party. Selectt's rights under the Terms of Use are freely transferable by Selectt to any third party without the requirement of seeking Your consent.</li>
                        <li>Severability: If, for any reason, a court of competent jurisdiction finds any provision of the Terms of Use, or any portion thereof, to be unenforceable, that provision shall be enforced to the maximum extent permissible so as to give effect to the intent of the parties as reflected by that provision, and the remainder of the Terms of Use shall continue in full force and effect.</li>
                        <li>Waiver: Any failure by Selectt to enforce or exercise any provision of the Terms of Use, or any related right, shall not constitute a waiver by Selectt of that provision or right.</li>
                      </ol>
                    </div>

                    {/* Feedback and Information */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">16. Feedback and Information :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Any feedback You provide on the Platform shall be deemed to be non- confidential. Selectt shall be free to use such information on an unrestricted basis. Further, by submitting the feedback, You represent and warrant that (i) Your feedback does not contain confidential or proprietary information of You or of third parties; (ii) Selectt is not under any obligation of confidentiality, express or implied, with respect to the feedback; (iii) Selectt may have something similar to the feedback already under consideration or in development; and (iv) You are not entitled to any compensation or reimbursement of any kind from Selectt for the feedback under any circumstances. When You provide feedback on the Platform, You: (i) release and discharge Selectt from any and all liability for a breach of this representation, and (ii) delete and remove the entire or such part of any feedback posted by You that, in the opinion of Selectt, is not in compliance with these Terms of Use; and (iii) communicate the feedback to other users, including registered trading partners.</li>
                        <li>Any feedback posted by You on the Platform regarding any Platform Service or seller support services availed by You may be required to be substantiated by Selectt as evidence, as necessitated or requested by Selectt.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ── PURE RIDE TERMS ──
              <div className="space-y-6">
                
                <div className="pt-2">
                  <h3 className="text-center font-black text-[#0C1B33] text-base md:text-lg uppercase tracking-widest mb-6 underline">
                    PART C – INSPECTION REPORT AS A SERVICE
                  </h3>

                  <div className="space-y-6">
                    {/* Disclaimer */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">17. Disclaimer :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>This Inspection Report reflects the condition of the vehicle as observed and recorded by Selectt's evaluator at the time of inspection, to the best of their ability. The evaluation is based on a visual and functional assessment carried out, at that time, out without dismantling components, performing invasive tests, or using advanced diagnostic tools unless explicitly stated. Vehicle condition may vary due to usage, time, undisclosed defects, or factors not evident at the time of inspection.</li>
                        <li>This Inspection Report is provided for informational purposes only and shall not be treated as a warranty, representation, certification, or assurance of the vehicle's performance, valuation, marketability, future condition, or fitness for a particular purpose. By relying on this Report, the customer agrees that Selectt Technologies Private Limited, its employees, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damage or loss, arising out of the use, interpretation, or reliance on this Report. The Report is provided to the best of its ability, knowledge and is subject to the Terms & Conditions provided herein.</li>
                      </ol>
                    </div>

                    {/* Purpose and Scope */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">18. Purpose and Scope :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The Inspection Report ("Report") is prepared by Selectt pursuant to a visual and functional assessment of the vehicle performed at the time of inspection.</li>
                        <li>The Report is meant to provide preliminary information regarding the condition and health of the inspected vehicle and is not a definitive or exhaustive technical assessment.</li>
                      </ol>
                    </div>

                    {/* Nature of Assessment */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">19. Nature of Assessment :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The inspection is conducted without dismantling vehicle parts or performing invasive testing unless specified.</li>
                        <li>Findings may not reveal hidden, latent, progressive, intermittent, accidental, electronic, or internal defects not apparent at the time of inspection.</li>
                        <li>The condition of the vehicle may change due to subsequent use, repairs, tampering, weather, natural wear and tear, odometer or meter alterations, or concealed issues.</li>
                      </ol>
                    </div>

                    {/* No Warranty or Guarantee */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">20. No Warranty or Guarantee :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>
                          <span className="font-bold text-[#0C1B33]">The Report does not constitute:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>A certification or endorsement of vehicle condition,</li>
                            <li>A valuation or pricing recommendation,</li>
                            <li>A guarantee of performance, quality, or future condition,</li>
                            <li>A fitness or merchantability guarantee for any particular purpose.</li>
                          </ul>
                        </li>
                        <li>No statement in the Report shall be construed as a representation or warranty by Selectt.</li>
                        <li>The Report does not represent or determine the market price or commercial valuation of the inspected vehicle.</li>
                      </ol>
                    </div>

                    {/* Reliance and Responsibility */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">21. Reliance and Responsibility :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The customer acknowledges and agrees that reliance upon the Report is solely at their discretion.</li>
                        <li>Selectt strongly advises customers to obtain additional independent inspections, expert opinions, or diagnostic tests as required for any defect in the inspected vehicle.</li>
                      </ol>
                    </div>

                    {/* Limitation of Liability */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">22. Limitation of Liability :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>
                          <span className="font-bold text-[#0C1B33]">Selectt, its officers, employees, and affiliates shall not be liable, under any circumstances, for:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>Vehicle defects or failures,</li>
                            <li>Depreciation or loss of value,</li>
                            <li>Mechanical or electronic breakdowns,</li>
                            <li>Hidden or undisclosed defects,</li>
                            <li>Damages, accidents, or losses occurring after the inspection.</li>
                          </ul>
                        </li>
                        <li>Selectt shall not be liable for any direct, indirect, consequential, incidental, or financial loss, including repair costs, insurance issues, purchase disputes, resale loss, or valuation claims arising from use or reliance on the Report.</li>
                      </ol>
                    </div>

                    {/* Customer Disclosure */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">23. Customer Disclosure :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The customer shall disclose any known issues, insurance claims, repairs, accidental history, modification, or defects to Selectt prior to inspection.</li>
                        <li>Selectt shall not be liable for any omission or misrepresentation by the customer or third parties.</li>
                      </ol>
                    </div>

                    {/* Intellectual Property */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">24. Intellectual Property :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>The Report is proprietary to Selectt and shall not be reproduced, circulated, sold, or shared commercially without written consent.</li>
                      </ol>
                    </div>

                    {/* Governing Law and Jurisdiction */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">25. Governing Law and Jurisdiction :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>These Terms shall be governed by the laws of India.</li>
                        <li>Any disputes shall be subject to the sole jurisdiction of the courts of New Delhi.</li>
                      </ol>
                    </div>

                    {/* Acceptance */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">26. Acceptance :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>Purchase, download, receipt, or reliance on the Report constitutes full acceptance of these Terms & Conditions.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-center font-black text-[#0C1B33] text-base md:text-lg uppercase tracking-widest mb-6 underline">
                    PART D – CONSENT TO FETCH VEHICLE BACKGROUND DATA
                  </h3>

                  <div className="space-y-6">
                    {/* Customer Consent */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">1. Customer Consent :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>By using the Platform and providing your Vehicle Information (including registration number, chassis number, owner details and related identifiers), you expressly authorize us and our affiliates to access, retrieve, fetch, collect, process, use, disclose and analyze vehicle history and related data from third-party public and private data sources (including government databases, transport department portals, RTO/Vahan and other registry systems, service records databases, challan and violation systems, hypothecation/financier records, and other relevant data providers) (collectively, the "Vehicle Background Data").</li>
                      </ol>
                    </div>

                    {/* Purpose of Data Access */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">2. Purpose of Data Access :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>
                          <span className="font-bold text-[#0C1B33]">You acknowledge and agree that we may retrieve and use your Vehicle Background Data for purposes including, without limitation:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>assessing, validating, and verifying the vehicle's history and condition;</li>
                            <li>preparing vehicle reports for inspection, valuation, sale, warranty, assurance, buy-back or related programs;</li>
                            <li>improving the accuracy, transparency and quality of the Platform's services and offerings;</li>
                            <li>complying with applicable laws, regulations or lawful requests of government authorities; and</li>
                            <li>any other lawful business purposes connected with the services you request or avail on the Platform.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    {/* Sharing and Disclosure */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">3. Sharing and Disclosure :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>
                          <span className="font-bold text-[#0C1B33]">You expressly consent that Selectt may share your Vehicle Background Data with:</span>
                          <ul className="list-disc pl-6 mt-1 space-y-1.5 text-slate-500">
                            <li>third-party service providers that assist in data retrieval, processing and analytics;</li>
                            <li>regulators, law enforcement agencies, courts or other government authorities where required by law; and</li>
                            <li>any other entities/persons as permitted under applicable law or as notified in our Privacy Policy.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    {/* Data Retention and Protection */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">4. Data Retention and Protection :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>We will retain Vehicle Background Data only for as long as necessary to fulfil the purposes above and in accordance with applicable laws and our Privacy Policy. We will implement commercially reasonable technical and organizational measures to safeguard your Vehicle Background Data against unauthorized access, loss or misuse.</li>
                      </ol>
                    </div>

                    {/* Withdrawal of Consent */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">5. Withdrawal of Consent :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>You may withdraw your consent at any time by contacting us at the details provided in these Terms or the Privacy Policy. However, you acknowledge that withdrawal of consent may limit our ability to provide certain services (including report generation and sale facilitation) to you, and may lead to termination of certain features or services on the Platform.</li>
                      </ol>
                    </div>

                    {/* Representations */}
                    <div>
                      <h4 className="font-bold text-[#0C1B33] text-base mb-2">6. Representations :</h4>
                      <ol className="list-roman pl-6 space-y-2 text-xs md:text-sm">
                        <li>By providing this consent, you represent that: (i) you are the lawful owner or authorized representative of the vehicle and have the right to authorize access to its background data; and (ii) the information you have provided to us is accurate, complete and up-to-date.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditionsPage;
