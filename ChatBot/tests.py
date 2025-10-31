import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np

# Define the words and their 3D embeddings (features)
embeddings_3d = {
    'King': (10, 5, -5),
    'Man': (2, 5, -5),
    'Woman': (2, -5, -5),
    'Queen': (10, -5, -5),
    'Banana': (-5, 0, 5),
    'Apple': (-5, 0, 5)
}

words = list(embeddings_3d.keys())
coords = list(embeddings_3d.values())
x_coords = [c[0] for c in coords]
y_coords = [c[1] for c in coords]
z_coords = [c[2] for c in coords]

# Create the 3D plot
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# Plot the word embeddings as points
ax.scatter(x_coords, y_coords, z_coords, color='blue', s=100)

# Add labels for each point
for word, (x, y, z) in embeddings_3d.items():
    ax.text(x + 0.5, y + 0.5, z + 0.5, word, color='black', fontsize=9)

# Highlight clusters
# People cluster (King, Man, Woman, Queen)
people_x = [embeddings_3d[w][0] for w in ['King', 'Man', 'Woman', 'Queen']]
people_y = [embeddings_3d[w][1] for w in ['King', 'Man', 'Woman', 'Queen']]
people_z = [embeddings_3d[w][2] for w in ['King', 'Man', 'Woman', 'Queen']]
ax.text(np.mean(people_x), np.mean(people_y), np.mean(people_z) + 3, 'People Cluster', color='darkgreen', fontsize=10)

# Fruit cluster (Banana, Apple)
fruit_x = [embeddings_3d[w][0] for w in ['Banana', 'Apple']]
fruit_y = [embeddings_3d[w][1] for w in ['Banana', 'Apple']]
fruit_z = [embeddings_3d[w][2] for w in ['Banana', 'Apple']]
ax.text(np.mean(fruit_x), np.mean(fruit_y) + 3, np.mean(fruit_z), 'Fruit Cluster', color='darkorange', fontsize=10)


# Set labels for the features
ax.set_xlabel('Royalty/Power Score (X)')
ax.set_ylabel('Gender Score (Y)')
ax.set_zlabel('Edible Score (Z)')
ax.set_title('3D Word Embeddings: Gender, Royalty, and Edible Features')

# Adjust limits for better display
ax.set_xlim([-6, 11])
ax.set_ylim([-6, 6])
ax.set_zlim([-6, 6])

# Add grid lines
ax.xaxis.pane.fill = False
ax.yaxis.pane.fill = False
ax.zaxis.pane.fill = False
ax.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.savefig('3d_word_embedding.png')

print("3d_word_embedding.png")
