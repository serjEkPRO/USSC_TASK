import matplotlib.pyplot as plt
import pandas as pd

data = {
    'date': pd.date_range(start='2023-10-01', periods=30, freq='D'),
    'licenses_used': [50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
                      100, 105, 110, 115, 120, 125, 130, 135,
                      140, 145, 150, 155, 160, 165, 170,
                      175, 180, 185, 190, 195]
}

df = pd.DataFrame(data)

plt.figure(figsize=(12, 6))
plt.plot(df['date'], df['licenses_used'], label='Licenses Used', color='blue')
plt.title('Daily License Usage')
plt.xlabel('Date')
plt.ylabel('Number of Licenses Used')
plt.legend()
plt.grid(True)
plt.show()
