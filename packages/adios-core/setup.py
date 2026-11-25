from setuptools import setup, find_packages

setup(
    name="adios-core",
    version="2.0.0",
    description="Core desktop application engine for the ADIOS Management Suite",
    author="ADIOS Org",
    packages=find_packages(),
    install_requires=[
        "PySide6>=6.5.0",
        "requests>=2.28.0",
        "pillow>=10.0.0",
    ],
    python_requires=">=3.9",
)
