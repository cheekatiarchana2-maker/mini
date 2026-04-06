import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

def analyze_patterns(df):
    # Select boolean columns for apriori
    basket = df[['ac_active', 'heater_active', 'tv_active', 'washing_machine_active']].copy()
    basket = basket.astype(bool)
    
    # Generate frequent itemsets
    frequent_itemsets = apriori(basket, min_support=0.05, use_colnames=True)
    
    if frequent_itemsets.empty:
        return []
        
    # Generate rules
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.1)
    
    # Convert to serializable format
    rules['antecedents'] = rules['antecedents'].apply(lambda x: list(x))
    rules['consequents'] = rules['consequents'].apply(lambda x: list(x))
    
    return rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].to_dict('records')
