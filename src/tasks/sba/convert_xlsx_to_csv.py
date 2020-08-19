# give the year and output file name as argument to be added in the csv
# arg 1 - year
# arg 2 - new file name
# arg 3 - loan_type (home or business)
import pandas as pd
import sys

def convert_xls_to_csv():
    # change the sheet name here
    data_xls = pd.read_excel('SBA_Disaster_Loan_Data_FY19.xlsx','FY19 Home', index_col=None,skiprows=[0,1,2,3],skipfooter=2)
    data_xls.insert(0, column="year",value=sys.argv[1])
    data_xls.to_csv(sys.argv[2], encoding='utf-8',index=False)

# upload data to the existing file
# if business add to business else add to home

def add_to_existing_data():
    if sys.argv[3] == 'Business':
        test = pd.read_csv(sys.argv[2])
        test.to_csv('sba_disaster_loan_data_business_FY01-17.csv',mode='a',index=False,header=False)
        test.to_csv('sba_business_FY01-17.csv',mode='a',index=False,header=False)
    elif sys.argv[3] == 'Home':
        test = pd.read_csv(sys.argv[2])
        test.to_csv('sba_disaster_loan_data_home_FY01-17.csv',mode='a',index=False,header=False)
        test.to_csv('sba_home_FY01-17.csv',mode='a',index=False,header=False)

def main():
    #convert_xls_to_csv()
    add_to_existing_data()

if __name__ == "__main__":
    main()