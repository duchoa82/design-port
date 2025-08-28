#!/usr/bin/env python3
"""
Terminal-based CSV viewer for user tracking data
"""

import csv
import os
import sys
from datetime import datetime
import pandas as pd

def print_header():
    """Print application header"""
    print("=" * 80)
    print("📊 CSV Data Viewer - User Tracking Analytics")
    print("=" * 80)
    print()

def print_menu():
    """Print main menu"""
    print("🔍 Choose an option:")
    print("1. 📊 View Statistics")
    print("2. 📋 View All Data")
    print("3. 🔍 Search Data")
    print("4. 📅 View Recent Records")
    print("5. 👥 Analyze by Target")
    print("6. 📈 View Timeline Analysis")
    print("7. 💬 Chat Interactions Summary")
    print("8. 📥 Export Filtered Data")
    print("9. 🔄 Refresh Data")
    print("0. ❌ Exit")
    print()

def view_statistics():
    """Display CSV statistics"""
    print("\n📊 CSV Statistics")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        print(f"📁 Total Records: {len(df):,}")
        print(f"📊 Total Columns: {len(df.columns)}")
        print(f"👥 Unique Users: {df['user-id'].nunique() if 'user-id' in df.columns else 'N/A'}")
        print(f"🎯 Unique Targets: {df['playground-mess-target'].nunique() if 'playground-mess-target' in df.columns else 'N/A'}")
        
        if 'start-time' in df.columns:
            print(f"📅 Date Range:")
            print(f"   Earliest: {df['start-time'].min()}")
            print(f"   Latest: {df['start-time'].max()}")
        
        print(f"💾 File Size: {os.path.getsize('../public/user_behavior_tracking.csv') / 1024:.2f} KB")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def view_all_data():
    """View all CSV data with pagination"""
    print("\n📋 View All Data")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        page = 1
        per_page = 10
        
        while True:
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            page_data = df.iloc[start_idx:end_idx]
            
            print(f"\n📄 Page {page} (Records {start_idx + 1}-{min(end_idx, len(df))} of {len(df)})")
            print("-" * 60)
            
            for idx, row in page_data.iterrows():
                print(f"Record {idx + 1}:")
                print(f"  User ID: {row.get('user-id', 'N/A')}")
                print(f"  Time: {row.get('start-time', 'N/A')}")
                print(f"  Target: {row.get('playground-mess-target', 'N/A')}")
                print(f"  Description: {str(row.get('playground-mess-description', 'N/A'))[:50]}...")
                print(f"  Step 1: {row.get('playground-step1', 'N/A')}")
                print(f"  Step 2: {row.get('playground-step2', 'N/A')}")
                print()
            
            if end_idx >= len(df):
                print("🏁 End of data reached")
                break
            
            choice = input("Press Enter for next page, 'q' to quit, or page number: ").strip()
            if choice.lower() == 'q':
                break
            elif choice.isdigit():
                page = int(choice)
            else:
                page += 1
                
    except Exception as e:
        print(f"❌ Error: {e}")

def search_data():
    """Search data by criteria"""
    print("\n🔍 Search Data")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        search_term = input("Enter search term: ").strip()
        if not search_term:
            print("❌ No search term provided")
            return
        
        # Search across all columns
        mask = df.astype(str).apply(lambda x: x.str.lower().str.contains(search_term.lower(), na=False)).any(axis=1)
        results = df[mask]
        
        print(f"\n🔍 Search Results for '{search_term}': {len(results)} records found")
        print("-" * 60)
        
        if len(results) > 0:
            for idx, row in results.iterrows():
                print(f"Record {idx + 1}:")
                print(f"  User ID: {row.get('user-id', 'N/A')}")
                print(f"  Time: {row.get('start-time', 'N/A')}")
                print(f"  Target: {row.get('playground-mess-target', 'N/A')}")
                print(f"  Description: {str(row.get('playground-mess-description', 'N/A'))[:80]}...")
                print()
        else:
            print("❌ No results found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def view_recent_records():
    """View most recent records"""
    print("\n📅 Recent Records")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        limit = input("How many recent records? (default 10): ").strip()
        limit = int(limit) if limit.isdigit() else 10
        
        recent_data = df.tail(limit)
        
        print(f"\n📅 Last {len(recent_data)} Records:")
        print("-" * 60)
        
        for idx, row in recent_data.iterrows():
            print(f"Record {idx + 1}:")
            print(f"  User ID: {row.get('user-id', 'N/A')}")
            print(f"  Time: {row.get('start-time', 'N/A')}")
            print(f"  Target: {row.get('playground-mess-target', 'N/A')}")
            print(f"  Description: {str(row.get('playground-mess-description', 'N/A'))[:60]}...")
            print(f"  Step 1: {row.get('playground-step1', 'N/A')}")
            print(f"  Step 2: {row.get('playground-step2', 'N/A')}")
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")

def analyze_by_target():
    """Analyze data by target"""
    print("\n👥 Analysis by Target")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        if 'playground-mess-target' not in df.columns:
            print("❌ Target column not found")
            return
        
        target_counts = df['playground-mess-target'].value_counts()
        
        print("🎯 Target Distribution:")
        print("-" * 40)
        
        for target, count in target_counts.items():
            percentage = (count / len(df)) * 100
            print(f"  {target}: {count} records ({percentage:.1f}%)")
        
        print(f"\n📊 Total unique targets: {len(target_counts)}")
        
        # Show details for a specific target
        print("\n🔍 View details for specific target:")
        target_choice = input("Enter target name (or press Enter to skip): ").strip()
        
        if target_choice:
            target_data = df[df['playground-mess-target'] == target_choice]
            if len(target_data) > 0:
                print(f"\n📋 Details for '{target_choice}':")
                print("-" * 50)
                for idx, row in target_data.iterrows():
                    print(f"  Record {idx + 1}: {row.get('start-time', 'N/A')} - {row.get('playground-mess-description', 'N/A')[:50]}...")
            else:
                print(f"❌ No records found for '{target_choice}'")
                
    except Exception as e:
        print(f"❌ Error: {e}")

def timeline_analysis():
    """Analyze timeline data"""
    print("\n📈 Timeline Analysis")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        if 'playground-mess-timeline' not in df.columns:
            print("❌ Timeline column not found")
            return
        
        timeline_counts = df['playground-mess-timeline'].value_counts()
        
        print("⏰ Timeline Distribution:")
        print("-" * 40)
        
        for timeline, count in timeline_counts.items():
            if pd.notna(timeline) and timeline != 'null':
                percentage = (count / len(df)) * 100
                print(f"  {timeline}: {count} records ({percentage:.1f}%)")
        
        print(f"\n📊 Total timeline records: {len(timeline_counts)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def chat_interactions_summary():
    """Summary of chat interactions"""
    print("\n💬 Chat Interactions Summary")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        chat_columns = ['chat-bubble-1', 'chat-bubble-2', 'chat-bubble-3', 'chat-bubble-4', 'chat-bubble-free']
        
        total_interactions = 0
        for col in chat_columns:
            if col in df.columns:
                interactions = df[col].notna().sum()
                total_interactions += interactions
                print(f"  {col}: {interactions} interactions")
        
        print(f"\n📊 Total chat interactions: {total_interactions}")
        print(f"📊 Average interactions per record: {total_interactions / len(df):.1f}")
        
        # Show some sample chat interactions
        print(f"\n💬 Sample Chat Interactions:")
        print("-" * 50)
        
        for col in chat_columns:
            if col in df.columns:
                sample_data = df[col].dropna().head(3)
                if len(sample_data) > 0:
                    print(f"\n{col}:")
                    for idx, interaction in sample_data.items():
                        print(f"  - {str(interaction)[:80]}...")
                        
    except Exception as e:
        print(f"❌ Error: {e}")

def export_filtered_data():
    """Export filtered data to new CSV"""
    print("\n📥 Export Filtered Data")
    print("-" * 40)
    
    try:
        df = pd.read_csv('../public/user_behavior_tracking.csv')
        
        print("🔍 Apply filters:")
        search_term = input("Search term (or press Enter to skip): ").strip()
        
        filtered_df = df.copy()
        
        if search_term:
            mask = df.astype(str).apply(lambda x: x.str.lower().str.contains(search_term.lower(), na=False)).any(axis=1)
            filtered_df = df[mask]
            print(f"📊 Filtered to {len(filtered_df)} records")
        
        if len(filtered_df) > 0:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"../public/filtered_export_{timestamp}.csv"
            
            filtered_df.to_csv(filename, index=False)
            print(f"✅ Exported to: {filename}")
            print(f"📊 Exported {len(filtered_df)} records")
        else:
            print("❌ No data to export")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main application loop"""
    csv_path = '../public/user_behavior_tracking.csv'
    
    if not os.path.exists(csv_path):
        print("❌ CSV file not found at:", csv_path)
        print("💡 Make sure you're running this script from the server directory")
        return
    
    print_header()
    
    while True:
        print_menu()
        
        choice = input("Enter your choice (0-9): ").strip()
        
        if choice == '0':
            print("\n👋 Goodbye!")
            break
        elif choice == '1':
            view_statistics()
        elif choice == '2':
            view_all_data()
        elif choice == '3':
            search_data()
        elif choice == '4':
            view_recent_records()
        elif choice == '5':
            analyze_by_target()
        elif choice == '6':
            timeline_analysis()
        elif choice == '7':
            chat_interactions_summary()
        elif choice == '8':
            export_filtered_data()
        elif choice == '9':
            print("\n🔄 Refreshing data...")
            print("✅ Data refreshed!")
        else:
            print("❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")
        print("\n" + "=" * 80)

if __name__ == "__main__":
    main()

