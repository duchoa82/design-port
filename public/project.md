
# Applying Blockchain in Counterfeit Prevention Ideations

When people hear about **Blockchain**, they often think of cryptocurrencies like Bitcoin or digital currencies, and I was no exception. However, one day I came across an article on VNExpress about how Blockchain is being used to combat counterfeiting in Vietnam, which prompted me to take the time to research it further. I discovered how Blockchain works and its practical applications. As a result, I gained a completely different perspective and recognized the immense potential for developing various industries, from food, chemicals, logistics, to copyright protection.

Below is an example and idea for the logistics industry. However, to make it easier to visualize, I will first summarize what I have learned about how Blockchain works.

## **What is Blockchain?**

Imagine **Blockchain** as a massive information storage system that can be linked together to form a complete chain of information. Instead of being managed by a single person or organization, it is not managed or altered by anyone throughout its operation. The key feature is:

- **Block**: Information is recorded in groups and grouped into **blocks.** To store information in blocks, it must first meet the requirements of **a smart contract, which is** where developers **define the rules and data schema** that parties will interact with.
- **Blockchain**: A combination of multiple blocks forming a complete information chain (e.g., a logistics tracking information chain for all orders, or a traceability information chain for a batch of dietary supplements, etc.).
![](/projects/project-details/project1/project1-img1.jpg)
The reasons why blockchain is considered a secure and transparent information storage solution are:

- **No single owner:** Information is copied and stored across numerous computers. This prevents it from being controlled by any individual or organization.
- **Information cannot be altered:** Once information meets the required format and is stored in a Block, it cannot be changed by anyone.
- **Encrypted and securely "locked":** Each block is identified by a code called a hash. This code ensures that pages are connected seamlessly and securely. If someone attempts to alter an old page, the code will be broken, and the entire network will immediately detect the tampering.

Here's how a blockchain system interacts with each other in steps

**The basic flow for information to be recorded and accessible on the Blockchain**
![Example of how to record a block works when farmers record information to block](/projects/project-details/project1/project1-img2.jpg)

1. **Recording an event (Transaction):**
    - When an event occurs (e.g., a farmer harvests coffee, a factory packages the product) the system requires the person responsible to enter information about the event (this information is defined as a Transaction), but at this point, the information has not been stored in the Block (this type of information is called Off-chain block)
    - **Example:** A transaction could be "Coffee batch A was harvested on day X by farmer Y". However, the factory owner and shift supervisor must confirm before it is recorded in the block
    
2. **Verified by Peers and "Miners" (Miners and Nonce):**
    
    With an internal information system 
    
    - Designated parties must confirm this information. After confirmation, it is recorded on the Block (on-chain).
    
    In Crypto, the parties confirming the information are miners,
    
    - When transactions are sent (buying/selling crypto)  **miners (** powerful computers in the network **)** will group multiple transactions into a new off-chain block
    - To be accepted, the miners must solve a complex mathematical problem by finding a "secret code" called **a Nonce**.
    - To find the Nonce, they must try billions of passwords until it matches. When a miner finds the Nonce, the block is confirmed as valid and the information is recorded in the Block (on-chain).
    
    At this point, all information in that block (including the transactions) is **permanently** recorded **and cannot be altered**.
    
3. **Retrieving information:**
After the information is fully recorded, users can easily access and view the entire history. They typically only need **to scan a QR code** on the product, and the app will display the entire product journey transparently.
    
    

**Practical applications:**

- **Anti-counterfeiting:** Since information on Blockchain cannot be altered, each product will have a unique and reliable "history." When you scan the product code, you can quickly and accurately view its origin, giving you peace of mind and helping you avoid purchasing counterfeit goods.
- **Traceability of raw materials:** In industries such as food production, if raw materials are found to be spoiled or problematic (such as livestock or poultry diseases), the Blockchain system will help trace back and quickly find all related products on the market. As a result, the recall and handling of defective products will be more effective, minimizing risks for consumers.

**Notable real-world projects:**

- **Starbucks** with the **Bean-to-Cup** project: enabling customers to trace the origin of every cup of coffee they consume, from the farm to the cup in their hands.
- **Walmart** with the **IBM Food Trust** platform: shortening the time to trace the origin of products (e.g., leafy greens, mangoes) from weeks to just seconds, which is crucial for ensuring food safety.
- **LVMH Group** (owner of brands like Louis Vuitton and Dior) with the **AURA Blockchain Consortium**: providing ""digital certificates"" for luxury products, enabling customers to verify authenticity and ownership history, and combat counterfeiting.

---

## Showcase: application in counterfeit prevention

### **Context:**

Vietnam is taking serious steps to combat counterfeit and low-quality goods, especially those with unclear origins or unverified production processes.

This ongoing issue across industries like supplements, food, and cosmetics prompted me to rethink the potential of Blockchain as a transparent, tamper-proof infrastructure for building consumer trust.

To ensure transparency and traceability of functional foods in the market, as well as build customer trust, businesses are developing a system to enable consumers to trace product information or prove to authorities the origin of products, as well as business licenses and activities, most accurately and transparently.

Additionally, this solution enables businesses to trace defective products in the market when issues arise quickly.

### **Solution:**

To determine the project scope, we will review the requirements outlined in the proposal, with the output requirements being: transparency and the fastest possible traceability.

**+ For transparency:** only blockchain can ensure that data is stored on the system and cannot be altered, as the blockchain mechanism ensures that once information is stored, it cannot be changed.

**+ For traceability,** SQL can be used to query the product history, provided that sufficient information is defined at each step in the production process.

### **Define Workflow:**

After understanding the concepts and outputs, I proceeded to define the workflow for off-chain and on-chain points as follows:

Each "Step" below represents an important event that needs to be recorded. These events, once confirmed, create a **Transaction** and are recorded on **the Blockchain (on-chain)**.

For the showcase scale, I will present a simplified workflow between the factory, the transportation unit, and the distributor as follows:

1. **Supplier**: Suppliers must record the raw material harvesting process, including pesticide usage and the use of genetically modified seeds.
2. **Factory**: The factory must record the production process: temperature, hygiene conditions, and finished products.
3. **Transportation**: Record the entire transportation process, including temperature and air quality in the cargo compartment.
4. **Supermarkets:** Record temperature, date of receipt, date of sale, buyer, etc.

### Technology solutions

To build a blockchain system that meets the above requirements, I will choose a consortium blockchain system to ensure sufficient privacy for the company while allowing end users to access the system.

Currently, there are many low-code platforms available for building consortium blockchain systems, such as IBM's open-source Hyperledger Fabric, or cloud services like AWS and Azure, which also provide support, making system development more straightforward.

### Challenges

1. **New & unfamiliar technology**
    
    Blockchain is still relatively new to many businesses. Convincing stakeholders required significant effort, from explaining real-world use cases to showing how it solves specific trust and traceability problems.
    
 This also meant **higher costs for R&D, team training, and hiring technical talent** with blockchain expertise.
    
2. **High dependency on data accuracy & process discipline**
    
    For blockchain to be meaningful, every piece of input data must be **accurate, verified, and responsibly managed**.
    
 This required **educating internal teams** (e.g. suppliers, QA, transport staff) about their role in the blockchain system, especially when confirming off-chain transactions that would later be recorded on-chain.
    
3. **User trust and System trust**
    
    Even with a blockchain backend, **consumers don't automatically trust what they see**. If the frontend UX feels clunky or the QR scan doesn't load instantly, the perceived trust can drop.
    
4. **Scalability vs. Privacy tension**
    
    Choosing a **consortium blockchain** helped balance transparency and privacy, but it introduced trade-offs:
    
    - More complex permission logic.
    - Careful design of what is exposed to public users vs. internal peers.
  - This increased architectural complexity early in MVP phase.
5. **Legal and compliance uncertainty**
    
    Blockchain for traceability touches areas like **consumer data privacy, food safety standards, and digital authentication** many of which **lack clear regulation** in emerging markets.
    
This posed long-term risks if regulatory environments shift.
    

---

### Lessons Learned

### **1. Blockchain is More Than Crypto**

- Its real strength lies in **tamper-proof, distributed information**.
- Useful in any context requiring provenance, history, or secure logs.

---

### 2. Smart Contract Logic is the Real Product

- Writing smart contracts is like writing **product logic**.
- Requires precise definition of who can write, confirm, and view what.

---

### 3. Workflow First, Then Platform

- Before choosing tech, clearly map the off-chain and on-chain data.
- This ensures the system is both useful and scalable.

---

## Impact Highlights

- Gained product-level understanding of blockchain systems.
- Designed a realistic, testable workflow for food traceability.
- Identified potential platforms for MVP development.

---

## Final Thoughts

Blockchain isn't magic. But when mapped to real problems like counterfeit prevention or food recalls, it becomes a **powerful infrastructure for trust and transparency**.

> Technology doesn't matter if it doesn't solve a real, observable problem. Blockchain finally made sense to me when I applied it to one.
>
