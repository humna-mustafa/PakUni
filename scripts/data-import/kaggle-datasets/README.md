# Kaggle Datasets for PakUni

## How to Download

### Option 1: Kaggle CLI (Recommended)
1. Install Kaggle CLI: `pip install kaggle`
2. Set up API credentials from https://www.kaggle.com/settings
3. Run the download commands below

### Download Commands
```bash
# HEC Universities (geolocation, distance education)
kaggle datasets download -d whisperingkahuna/hec-accredited-universities-of-pakistan-dataset -p ./data-import/kaggle-datasets --unzip

# Pakistan Intellectual Capital (faculty profiles)
kaggle datasets download -d zusmani/pakistanintellectualcapitalcs -p ./data-import/kaggle-datasets --unzip

# Pakistan Job Market (career insights)
kaggle datasets download -d zusmani/pakistans-job-market -p ./data-import/kaggle-datasets --unzip

# Intermediate Colleges
kaggle datasets download -d tayyarhussain/all-the-intermediate-colleges-in-pakistan -p ./data-import/kaggle-datasets --unzip

# All Universities Basic
kaggle datasets download -d tayyarhussain/all-of-the-universities-in-pakistan -p ./data-import/kaggle-datasets --unzip

# Education Statistics
kaggle datasets download -d tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018 -p ./data-import/kaggle-datasets --unzip
```

### Option 2: Manual Download
Visit each URL and click "Download" button:
- https://www.kaggle.com/datasets/whisperingkahuna/hec-accredited-universities-of-pakistan-dataset
- https://www.kaggle.com/datasets/zusmani/pakistanintellectualcapitalcs
- https://www.kaggle.com/datasets/zusmani/pakistans-job-market
- https://www.kaggle.com/datasets/tayyarhussain/all-the-intermediate-colleges-in-pakistan
- https://www.kaggle.com/datasets/tayyarhussain/all-of-the-universities-in-pakistan
- https://www.kaggle.com/datasets/tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018

## Features Added to PakUni

### 1. University Enhancement
- **Geolocation**: Map coordinates for all universities
- **Distance Education**: Filter universities offering online programs
- **Contact Details**: Direct contact info for admissions

### 2. Career Guidance
- **Job Market Data**: 7,000+ real job postings
- **Popular Fields**: See which departments are hiring
- **Experience Levels**: Understand entry-level requirements

### 3. Faculty Insights
- **Research Areas**: 500+ PhD faculty profiles
- **Specializations**: AI, ML, Data Science faculty info
- **University Strengths**: Faculty expertise by institution

### 4. College Search
- **Intermediate Colleges**: Pre-university options
- **Affiliations**: Board affiliations
- **Programs**: Available study programs

### 5. Analytics
- **Historical Trends**: Education growth since 1947
- **Student-Teacher Ratios**: By province and year
