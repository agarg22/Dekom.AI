import pickle

saveFile = open('database.prb', 'wb')
pickle.dump([], saveFile)
saveFile.close()
