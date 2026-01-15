# 🎯 Expanded Template - Quick Reference

## What Changed?

Your CSV template went from **16 columns → 34 columns**

You now have everything in one sheet:
- Programs offered
- Merit criteria (3-year history)
- Scholarships & fees
- Contact information
- Campus facilities
- Alumni information
- Accreditation & partnerships
- And much more!

---

## 📋 All 34 Columns (In Order)

```
1.  name                          17. programs_offered
2.  short_name                    18. merit_criteria_2024
3.  type                          19. merit_criteria_2023
4.  province                      20. merit_criteria_2022
5.  city                          21. entry_requirements
6.  address                       22. scholarship_types
7.  website                       23. scholarship_amount
8.  email                         24. annual_fee_estimate
9.  phone                         25. contact_person
10. established_year              26. contact_phone
11. ranking_hec                   27. notable_alumni
12. ranking_national              28. application_deadline
13. is_hec_recognized             29. student_strength
14. description                   30. faculty_count
15. admission_url                 31. accreditation_bodies
16. campuses                      32. international_partnerships
                                  33. research_centers
                                  34. library_books
                                  35. lab_facilities
                                  36. sports_facilities
```

---

## 🔧 Format Rules (New Columns)

### Lists (Pipe Separator |)
```
✓ Physics|Chemistry|Biology
✓ Cambridge|MIT|Stanford
✓ Scholarship1|Scholarship2|Scholarship3

✗ Physics, Chemistry (wrong - use pipe)
✗ Physics - Chemistry (wrong - use pipe)
```

### Merit Criteria
```
✓ 85-90 percent in FSC
✓ 80+ percent in FSC
✓ 75-85% in FSC

✗ 85%-90% (wrong format)
✗ 85 to 90 (wrong)
```

### Dates
```
✓ 31-Mar-2024
✓ 15-Apr-2024
✓ 01-Jan-2024

✗ 31/03/2024 (wrong)
✗ 2024-03-31 (wrong)
```

### Numbers (No Currency)
```
✓ 120000-180000
✓ 50000-150000
✓ 800000

✗ 120,000 PKR (no currency)
✗ Rs. 120000 (no Rs.)
```

### Sports (Dash Separator -)
```
✓ Cricket - Tennis - Badminton - Swimming
✓ Football - Basketball - Volleyball

✗ Cricket|Tennis (wrong for sports)
```

---

## 📝 Filling the Template (Step by Step)

### Step 1: Basic Info (Columns 1-16)
```
Same as before - name, location, phone, etc.
```

### Step 2: Programs (Column 17)
```
BS Physics|BS Chemistry|BS Biology|MS Physics|PhD Physics
```
List all degrees separated by |

### Step 3: Merit Requirements (Columns 18-20)
```
2024: 85-90 percent in FSC
2023: 83-88 percent in FSC
2022: 82-87 percent in FSC
```
Show 3-year trend

### Step 4: Entry Requirements (Column 21)
```
FSC/Equivalent with min 60% marks|Entry test 50% weightage
```

### Step 5: Scholarship Info (Columns 22-23)
```
Types: Full Scholarship|Partial Scholarship|Merit Scholarship
Amount: 50000-150000 PKR per year
```

### Step 6: Fee & Contact (Columns 24-26)
```
Fee: 120000-180000 PKR
Contact: Dr. Muhammad Hassan
Phone: +92-51-9064-100
```

### Step 7: Alumni (Column 27)
```
Dr. Abdul Salam (Physicist)|Dr. Atta ur Rahman
```

### Step 8: Timeline (Column 28)
```
Application Deadline: 31-Mar-2024
```

### Step 9: Stats (Columns 29-30)
```
Students: 12000
Faculty: 800
```

### Step 10: Quality Indicators (Columns 31-32)
```
Accreditation: HEC - PMDC
Partners: Cambridge|MIT|Stanford
```

### Step 11: Facilities (Columns 33-36)
```
Research: Institute of Physics|Institute of Chemistry
Books: 800000
Labs: 50+
Sports: Cricket - Tennis - Badminton
```

---

## 💡 Examples

### Complete NUST Row
```
National University of Sciences and Technology,NUST,public,islamabad,Islamabad,H-12 Sector - Islamabad 44000,https://nust.edu.pk,info@nust.edu.pk,+92-51-9085-5000,1991,W4,2,true,Top engineering university,https://nust.edu.pk/admissions/,H-12|Rawalpindi|Karachi|Risalpur,BS Electrical|BS Mechanical|BS Civil|BE Chemical|MS Engineering,88-92 percent in FSC,85-90 percent in FSC,83-89 percent in FSC,FSC min 65%|NAT Test,Full|Half|Quarter Scholarship,60000-200000 PKR,150000-250000 PKR,Eng. Faisal Ahmed,+92-51-9085-200,Air Marshal Amir|Gen Musharraf,15-Apr-2024,18000,950,HEC - PEC,MIT|Stanford|Oxford,Energy Lab|Robotics Center,1200000,100+,Cricket - Football - Basketball
```

### Complete QAU Row
```
Quaid-i-Azam University,QAU,public,islamabad,Islamabad,Quaid-i-Azam University - Islamabad 45320,https://qau.edu.pk,info@qau.edu.pk,+92-51-9064-0000,1967,W4,1,true,Premier research university,https://qau.edu.pk/admissions/,Main Campus Islamabad,BS Physics|BS Chemistry|BS Biology|BS Mathematics|MS Physics|PhD Physics,85-90 percent in FSC,83-88 percent in FSC,82-87 percent in FSC,FSC min 60%|Entry test,Full|Partial|Merit Scholarship,50000-150000 PKR,120000-180000 PKR,Dr. Muhammad Hassan,+92-51-9064-100,Dr. Abdul Salam|Dr. Atta ur Rahman,31-Mar-2024,12000,800,HEC - PMDC,Cambridge|MIT|Stanford,Institute of Physics|Institute of Chemistry,800000,50+,Cricket - Tennis - Badminton
```

---

## 🚀 Quick Import

```bash
# 1. Fill all 34 columns
# 2. Save as CSV UTF-8

# 3. Validate
npm run validate-data -- --file universities.csv

# 4. Import
npm run import-data -- --file universities.csv

# Done! ✅
```

---

## ✅ Validation Checklist

- [ ] All 34 columns present
- [ ] Required fields filled
- [ ] Programs separated by |
- [ ] Merit criteria in correct format
- [ ] Scholarships separated by |
- [ ] Dates in DD-Mon-YYYY
- [ ] Numbers without currency symbols
- [ ] Phone with +92
- [ ] Website with https://
- [ ] Province lowercase
- [ ] Saved as CSV UTF-8

---

## 🎁 What App Shows

With complete data, app displays:

✅ All programs at each university
✅ Merit requirements with 3-year trend
✅ Scholarship options & amounts
✅ Contact person for admissions
✅ Campus facilities
✅ Notable alumni
✅ Application deadline
✅ International partnerships
✅ Research centers
✅ And much more!

---

## 📚 More Info

Read: **EXPANDED_TEMPLATE_GUIDE.md** for detailed column explanations

---

**Version**: 2.0 (Expanded)
**Columns**: 36 total
**Last Updated**: January 16, 2026
