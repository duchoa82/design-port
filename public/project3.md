# Data-inform to decrease the delay in the delivery order

## Project Introduction  
This project addresses a critical challenge: the product was struggling with **delivery delays** while lacking proper tracking of factors that truly impacted **user satisfaction and retention**. The goal was to uncover operational causes of delays and design **data-driven solutions** that both enhance the **user experience** and improve the **efficiency of delivery staff**.

## 1. Problem Framing  
As both a **Product Owner** and **UX Designer**, my responsibility is to balance:  

- **Business goals**: revenue growth, reducing operational costs
- **User needs**: reliable delivery, trust, and satisfaction

From recent data, I noticed a critical issue: **delivery delays**.  
This directly impacts:  
- **Operational Cost** (inefficient logistics)  
- **User Experience** (frustration, uncertainty)  
- **Retention Rate** (users churn when trust is lost)  

**My Mission:** Use **data-driven insights** to design solutions that improve on-time delivery, enhance user experience, and ultimately increase retention.


## 2. Data Exploration & Insights  
I worked closely with the data to understand the root causes.
![](/projects/project-details/project3/project3-img1.png)

### Key Observations
- **Vehicle type is the strongest factor**  
  - Bike deliveries → usually on-time  
  - Truck deliveries → often delayed  
- **Hub location influences vehicle choice**  
- **Distance and driver ID had low correlation**

### Impact on User Experience
- On-time = consistently *Happy ratings*  
- Delayed = ratings fall to *Acceptable* or *Unhappy*  

**Insight:** Delays are not just operational inefficiencies — they translate into **negative user emotions** and lost retention.

| **Factor** | **Relationship** | **Impact** |
| --- | --- | --- |
| **Vehicle** | Related directly | Vehicle affects delivery status directly. When the Vehicle is **Bike**, the Delivery Status is **On-Time**. When the Vehicle is a **Truck**, the Delivery Status is **Delayed**. |
| **Hub Location** | Not related directly | The Hub location affects Vehicle value. |
| **Distances, Driver ID** | Not affected at all | The Distances longer not affect the delivery status. |

**Conclusion**: **Delayed Order is affected by the Vehicle, this is the Truck**


---

## 3. Connecting Data to Retention  
Analyzing customer feedback (Likert scale, 300 monthly users): Easy to see that, on the Likert scale to show the happiness of customers with our services, we have 300 users in a month with 3 range of users satisfied.

| **Rate** | **Percentage** |
|---------|---------------|
| 2        | 20.1%          |
| 3        | 30.1%          |
| 4        | 30.1%          |
| 5        | 19.7%          |

As a **Product Owner**, I interpret this as:  
- Improving delivery time is not only a logistics fix but a **revenue lever**.  
- Each delay reduced satisfaction → directly threatening **lifetime value (LTV)**. 

To calculate the current Retention Percentage. I analyzed the percentage of customer happiness based on Likert scoring.
Table view customer feedback follows the Delivery Status.

![](/projects/project-details/project3/project3-img2.png)
Percentage of customer feedback
![](/projects/project-details/project3/project3-img3.png)

---

## 4. From Data to Design Opportunities

To answer these questions, I made a simple blueprint combined with job steps and How-Might-We statements to figure out the outcomes.
![](/projects/project-details/project3/project3-img4.png)

Here’s how I reframed insights into **How Might We (HMW)** opportunities:  

| Data Insight | HMW Question | Product / UX Solution |
|--------------|--------------|------------------------|
| Trucks cause delays | HMW reduce delay risk for truck deliveries? | Optimize **routing & scheduling** with traffic data |
| Users don’t understand delays | HMW improve transparency for users? | Show **real-time traffic/delay reasons** in-app |
| One-size-fits-all assignment | HMW assign vehicles smarter? | **Order categorization** to allocate bike vs truck |
| Missing qualitative data | HMW learn more about delays? | Add **driver inputs** (traffic, load size, weather) |


---

## 5. Product Strategy & Roadmap
With all insights and data above, as a Product Owner. I made the final product phase for this issue, with the goal is building the system with Data-Driven and Machine Learning reduces the delay time

**Phase 1 – Foundation**  
- Integrate **traffic API** → dynamic routes & transparency for users  
- Build **optimized delivery routines** by location & time  
- Start **logging reasons for delay**  

**Phase 2 – Scale & Intelligence**  
- Implement **classification system** for vehicle assignment  
- Develop **machine learning models** to predict ETA & delays  
- Use insights to continuously improve retention-focused KPIs  

---

## 6. Success Metrics (KPIs)
To evaluate the solutions by tracking the data, I made the Data KPIs below

- **User-Centric**  
  - Increase % of 4–5 ratings, reduce 2–3  
  - Improve NPS (Net Promoter Score)  
- **Business-Centric**  
  - Increase retention rate by X% over 6 months  
  - Reduce operational cost linked to failed deliveries  
- **Operational**  
  - Reduce monthly delayed orders  
  - Improve ETA accuracy (predicted vs actual)

---

## 7. Reflection  
Wearing both hats — **Product Owner & UX Designer** — shaped my approach:  

- As **PO**, I saw delays as a business threat and defined retention as the north star metric.  
- As **UX Designer**, I translated data into **user pain points** and **experience-focused solutions**.
- By combining both, I ensured that the strategy was **data-driven**, **user-centered**, and **business-aligned**.

This project reinforced my belief: **Great product design happens when data insights and user empathy meet business outcomes.**

